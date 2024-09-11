<!--
Copyright 2024 Elevation Beats Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
# Elevation Beats Inc - Student Portal

This repo is used to drive the Student Portal experience for Elevation Beats Inc. The portal will be used by clients (or parents) to check the latest attendance, recent payments made and balance (or credit).

## Get Started

Dependencies:

* nodejs v20.xx
* npm v10.x

1. Install nodejs (NVM preferred).
2. Install packages with `npm install`.
3. Login with clasp `npm run login`.
4. Create `.clasp-dev.json`, `.clasp-prod.json` & `.clasp.json` with following format:
```
{"scriptId":"script-ID-from-app-script","rootDir":"dist"}
```

## Development
Make changes to src/*.ts or src/*.html, and run `npm run deploy`