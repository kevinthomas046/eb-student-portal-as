/**
 * Copyright 2024 Elevation Beats Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Copyright 2024 Elevation Beats Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
function doGet() {
  Logger.log('Loading page');
  return HtmlService.createTemplateFromFile('page')
    .evaluate()
    .setTitle('Elevation Beats: Student Portal');
}

function getFamilies() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Parents');
  const data = sheet?.getDataRange().getValues() ?? [];
  const families = [];

  for (let i = 1; i < data.length; i++) {
    const parentId = data[i][0];
    const familyName = data[i][1];
    families.push({ ParentId: parentId, FamilyName: familyName });
  }

  return families;
}

const families = getFamilies();
console.log(families);
console.log(hello());
