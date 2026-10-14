# Code Review

I read through the whole starter project (backend and frontend), then tested the API in Postman and clicked through the app, including with the backend turned off. Where I write "I tested", I reproduced the problem myself. The other findings come from reading the code.

I left out the Reports feature and the UI redesign, because those are assessment tasks and not problems in the existing code.

## Backend

### Bugs

#### B-01: PATCH lets clients change fields they should not

**What is wrong:** In `tasks.service.js`, `updateTask` spreads the whole request body into the saved task. The controller only checks `title` and `completed`, and never rejects other keys.

**I tested:** This request saved the extra field on the task:

```json
{
  "completed": true,
  "extra": 1
}
```

This one changed the task's id:

```json
{
  "id": "hacked",
  "title": "Updated title"
}
```

By the same logic, `createdAt` can be overwritten too.

**Why it matters:** The id is how a task is identified, so a client should never be able to change it. Extra fields also end up in the JSON file.

**How I would improve it:** Reject any key other than `title` and `completed` with a `400`, and build the updated task from those two fields only. `taskValidator.js` already has an allowlist I can reuse.

#### B-02: Title rules differ between POST and PATCH, and there is no maximum length

**What is wrong:** POST accepts any title that is not empty, even a single character. PATCH goes through an extra check in the service that requires at least two characters. Nothing limits how long a title can be.

**I tested:** A POST with a 5000-character title was accepted. The API documentation does not mention any limit.

**Why it matters:** A title you are allowed to create can be rejected when you edit a task to the same value. Very long titles also break the layout and make the JSON file bigger.

**How I would improve it:** Use one rule for both POST and PATCH: trim the title, then check the minimum and maximum length in one place.

```js
const title = payload.title.trim();

if (!title || title.length > 200) {
  throw new HttpError(400, 'Title must be between 1 and 200 characters.');
}
```

#### B-03: POST /activity accepts anything

**What is wrong:** `POST /activity` stores whatever it receives as `action` and `info`. Nothing checks the types, the length, or unknown fields.

**I tested:** `{}` returns `201` and saves a record with only `id` and `when`. `{"action": 123}` is accepted too, with a number as the action.

**Why it matters:** The file can contain records that do not match the documented `ActivityLog` shape. The feed, and later the Reports calculation, has to deal with them.

**How I would improve it:** Check that the body is an object and that `action` and `info` are strings. Trim them, set a maximum length, and reject unknown fields. I would also reject an empty body.

#### B-04: JSON writes can lose data or leave a broken file

**What is wrong:** Every change reads the whole JSON file, edits it in memory, and writes the whole file back. There is no write queue, and the write is not atomic.

**Why it matters:** If two requests overlap, the second one overwrites the first:

```text
Request A reads [task 1]
Request B reads [task 1]
Request A writes [task 1, task 2]
Request B writes [task 1, task 3]
```

The final file has lost `task 2`. If the process stops in the middle of a write, the file can be left with half a JSON document, and after that every read fails.

**How I would improve it:** Make writes to the same file run one at a time, and write to a temporary file first, then rename it over the original:

```js
const temporaryPath = `${filePath}.tmp`;
await fs.writeFile(temporaryPath, JSON.stringify(data, null, 2));
await fs.rename(temporaryPath, filePath);
```

#### B-05: Activity IDs can collide

**What is wrong:** `activity.service.js` creates ids with `String(Date.now())`.

**Why it matters:** Two entries created in the same millisecond get the same id. The frontend uses the id as the React `key`, so duplicates would cause warnings and wrong list updates.

**How I would improve it:** Use the existing `createId()` from `utils/id.js`, like the Tasks module does.

### Performance

#### B-06: Activity blocks the event loop with synchronous file calls

**What is wrong:** Activity uses `existsSync`, `readFileSync` and `writeFileSync`. Tasks uses the async `jsonStore` based on `fs/promises`.

**Why it matters:** While a synchronous call runs, Node cannot handle any other request. The two modules also behave differently when a file is missing, empty or invalid.

**How I would improve it:** Move Activity to the shared `jsonStore.js`, make its controller functions async, and wrap its routes with `asyncHandler`.

### Security

#### B-07: Request and field sizes have no deliberate limit

**What is wrong:** `app.js` calls `express.json()` with no options. Express applies a default limit of about 100 KB, but nobody chose that value. The task and activity fields have no maximum length either.

**Why it matters:** A title or an `info` value just under that limit is accepted and saved, so the JSON files can grow quickly. Clients also have no way to know what input size is allowed.

**How I would improve it:** Set a small body limit on purpose, and add maximum lengths in the validation:

```js
app.use(express.json({ limit: '10kb' }));
```

### Maintainability

#### B-08: Validation is written several times and the shared validator is never used

**What is wrong:** `taskValidator.js` has `validateCreateTask` and `validateUpdateTask`, but neither the controller nor the service imports them. The controller and the service each repeat similar checks, with different rules and different messages.

**Why it matters:** If I fix a rule in one place, the others stay the same. The one validator that does the job properly is dead code.

**How I would improve it:** Call the shared validator in the controller, pass the cleaned data to the service, and let the service handle only storage and the "not found" case.

#### B-09: Port and error handling are inconsistent

**What is wrong:** The backend runs on port `3000`, but the frontend fallback and the endpoint documentation say `4000`. The Tasks controller also builds some error responses by hand, while the service throws `HttpError` for the central error handler.

**Why it matters:** Both apps can start fine and still not talk to each other. Two different ways of returning errors make the API harder to use and debug.

**How I would improve it:** Pick one port and update the backend, the frontend config, the docs and `.env.example`. Keep the documented Activity success response as it is. Throw `HttpError` everywhere and let the error handler format all errors.

### Code quality

#### B-10: Activity code is duplicated and hard to read

**What is wrong:** `loadDataA` and `loadDataB` are the same function. Names like `fp`, `c`, `aSvc`, `x` and `b` say nothing about what they hold, and `get_activity` is snake_case while `addActivity` is camelCase.

**Why it matters:** A change to one loader has to be repeated in the other, and the names make the module hard to follow. It also looks like a different project from the Tasks module, which is much cleaner.

**How I would improve it:** Use one loader (the shared `jsonStore`), give things clear names, and follow the same structure and naming as Tasks.

## Frontend

### Bugs

#### F-01: The Activity page breaks when the API returns an error

**What is wrong:** The page calls `response.json()` without checking `response.ok`. When the proxy fails, it returns an error object, and the page saves that object as if it were the list of activities:

```json
{
  "error": {
    "message": "Unable to fetch activity logs."
  }
}
```

**I tested:** With the backend stopped, `/activity` broke instead of showing an error, because the page calls `.map()` on that object. When the request itself fails, the list is simply cleared and the page shows nothing.

**Why it matters:** A user cannot tell "there is no activity" from "something went wrong".

**How I would improve it:** Check `response.ok`, make sure the result is an array, keep loading and error state, and show a retry button.

#### F-02: The Next proxy routes lose backend status codes

**What is wrong:** `backendApi.ts` throws a plain `Error` that only keeps the message, so the status code is lost. Every route handler then answers `500`.

**I tested:** A PATCH to `/api/tasks/nope` returned `500` with "Task not found", while the backend uses `404` for a missing task.

**Why it matters:** The frontend cannot tell a validation error, a missing task and an unreachable backend apart.

**How I would improve it:** Keep the backend status in the error, forward it, return `400` for invalid request JSON, and use `502` when the backend cannot be reached.

#### F-03: One failed task update hides the whole task list

**What is wrong:** `useTasks` uses the same `error` state for loading the list and for updating a task. `TaskDashboard` only shows the list when there is no error.

**I tested:** After a failed toggle, the list disappeared and only the error box with Retry was left.

**Why it matters:** One failed action removes every task from the screen, even though the data is fine.

**How I would improve it:** Keep a separate error for updates. Show it near the task, or as a small message above the list, and keep the list visible.

### Performance

#### F-04: A timer makes the Activity list re-render for no reason

**What is wrong:** A timer updates `tick` every 1.4 seconds. Effects that depend on `tick` then copy the list and filter it again, even though the data has not changed.

**Why it matters:** The list re-renders again and again without any visible change, and the cost grows with the number of entries.

**How I would improve it:** Remove the timer and calculate the visible list from the data and the search text.

### Maintainability

#### F-05: The Activity page does too much in one component

**What is wrong:** One component handles fetching, filtering, formatting, the timer and rendering. It keeps three arrays in state that all describe the same data: `allActivity`, `shownActivity` and `forcedList`.

**Why it matters:** The arrays can get out of sync, and the page is hard to read, test and change. The Task Dashboard, by comparison, is split into a hook and small components.

**How I would improve it:** Keep only the loaded data, the search text, loading and error in state. Move fetching into a hook, and use one filter helper, like the Task Dashboard does.

### Code quality

#### F-06: Duplicate functions and an unused value in the Activity page

**What is wrong:** `formatTimeA` and `formatTimeB` are identical, and so are `applyFilterA` and `applyFilterB`. The filter runs twice in a row. `stats.everySecondTick` is stored but never shown.

**Why it matters:** The copies add noise, hide what the code really does, and have to be changed in several places.

**How I would improve it:** Keep one format function and one filter function outside the component, and remove the unused value.

### UX issues

#### F-07: Activity has no clear loading, error or retry state

**What is wrong:** While data loads, the page looks empty. After a failure there is no retry button. Every entry also shows the same timestamp twice.

**Why it matters:** The user cannot tell what is happening, and the feed looks unfinished.

**How I would improve it:** Add separate loading, error, retry and "no activity yet" states, and show one timestamp in a `<time>` element.

#### F-08: The empty message for tasks is not specific

**What is wrong:** `No tasks match this filter.` appears both when there are no tasks at all and when the chosen filter has no results.

**Why it matters:** The user cannot tell whether to change the filter or whether there is simply nothing to show.

**How I would improve it:** Use two messages, for example `No tasks have been created yet` and `No completed tasks match this filter`.

### React best practices

#### F-09: Effects are used to calculate values that could be computed directly

**What is wrong:** Effects set `shownActivity` and `forcedList` from other state, and `tick` is used to trigger them.

**Why it matters:** Each effect causes an extra render, and the values can disagree with each other.

**How I would improve it:** Store only the loaded data and the search text, and calculate the filtered list while rendering, with `useMemo` if needed.

#### F-10: Activity requests are never cancelled

**What is wrong:** The fetch effect has no cleanup and no `AbortController`.

**Why it matters:** A slow response can still update state after the user has left the page, or after a newer request has started.

**How I would improve it:** Abort the request when the component unmounts:

```js
const controller = new AbortController();
fetch('/api/activity', { signal: controller.signal });

return () => controller.abort();
```
