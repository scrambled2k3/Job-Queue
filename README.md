# Job-Queue
Create a job queue that collects site html and persists it to a database when given a URL.

## To setup
1. Run `npm install` from the root directory.
2. Rename `example.env` to `.env`. Use the `.env` file to enter in your redis server ip address and port.
3. Open 2 terminals in the root directory, execute `node apiServer.js` in one and `node serviceWorker.js` in the other.
4. Make a `POST` http request to the root, `/`, endpoint (should be `http://127.0.0.1:3000` unless you changed the port) and provide a `url` in the body. (Ex. `{url: 'http://www.google.com'}`).
5. A `job_id` will be in the return payload that you can then use to make a `GET` request to the root `/` endpoint and retrieve the URL's HTML content.  The `job_id` must be submitted as a query string. (Ex. http://127.0.0.1:3000?job_id=1234).
