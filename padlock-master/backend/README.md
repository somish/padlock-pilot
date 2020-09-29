= Installation =

- clone the repo into a directory where the `padlock` user has read permissions
- run `npm install`
- run `sudo ./daemon/install.sh`
- verify the service is running with `sudo systemctl status padlock`

= Endpoints =

GET
/api/project/:projectid/

- access the metadata associated with a project (total budget, gc, sc, etc)
- projectid: the address of the deployed project contract

/api/project/:projectid/:taskid/

- access the metadata associated with a task (sc's, budget, etc)
- projectid: the address of the deployed project contract containing the task
- taskid: the serialized index of the task within the project

/api/project/:projectid/:taskid/:documentid/

- access all data associated with a document (text/comment, jpg/image, pdf/doc)
- projectid: the address of the deployed project contract
- taskid: the serialized index of the task containing the document
- documentid: the serialized index of the document in the document within the task

/api/project/:projectid/:taskid/:documentid/hash/

- @tuan todo
- access only the hash of a docuemnt, for integrity check on client side
- projectid: the address of the deployed project contract
- taskid: the serialized index of the task containing the document
- documentid: the serialized index of the document in the document within the task

POST
/api/project/:projectid/:taskid/document?data&metadata
-@tuan todo
-upload document to CouchDB
-data: the pdf, jpg, or plaintext data being stored as a new document
-metadata: object containing timestamp, author, title. index within task, document hash
-@tuan not todo right now
-commit hash to project contract
