function getNewParentObject_() {
  return {
    name: '',
    address: '',
    phoneNumber: '',
    children: [],
    childrenAges: [],
    authorizedAdults: [],
    newVisitor: 0,
  };
}

var kristenObj = {
  name: 'Kristen Miller',
  address: '3405 River Oaks Dr.',
  phoneNumber: '9312602645',
  children: ['Emery', 'Eden', 'Nora'],
  childrenAges: ['K - 6', 'K - 6', '4 - pre-K'],
  authorizedAdults: ['Coburns', 'Allens', 'Jeremiah'],
  newVisitor: 0,
};

var jeromyObj = {
  name: 'Jeromy Coburn',
  address: '305 Green Springs Rd. Cookeville, TN 38506',
  phoneNumber: '9312602645',
  children: ['Judah Coburn', 'Remi Coburn'],
  childrenAges: ['4 - pre-K', '0 - 18mos.'],
  authorizedAdults: ['Coburns', 'Allens', 'Millers'],
  newVisitor: 0,
};

function getFormObject_(form, items, titles, response) {
  Logger.log('Creating form object...');
  try {
    return {
      form: form,
      items: items,
      titles: titles,
      response: response,
    };
  } catch(e) {
    Logger.error(e)
    GmailApp.sendEmail('jcoburn88@outlook.com', 'FATAL ERROR', ('Form object creation failure! \nERROR: ' + e.message));
  }
}

function findItem_(myForm, searchKey) {
  try {
    Logger.log('Returing requested item: ' + searchKey);
    return myForm.items[myForm.titles.indexOf(searchKey)];
  } catch (e) {
    Logger.log('ERROR: ' + e.message);
    GmailApp.sendEmail('jcoburn88@outlook.com','Error in findItem_' , ('FIND ITEM ERROR: ' + e.message + '.'));
    return null;
  }
}

function addParentName_(parentObj, parentName) {
  Logger.log('Adding parent name...');
  parentObj.name = parentName;
}

function addAddress_(parentObj, parentAddress) {
  Logger.log('Adding parent address...');
  parentObj.address = parentAddress;
}

function addParentPhoneNumber_(parentObj, parentPhone) {
  Logger.log('Adding parent phone number: ' + parentPhone);
  parentObj.phoneNumber = parentPhone;
}

function addParentChild_(parentObj, childName, childAge) {
  Logger.log('Adding child and age to arrays...');
  parentObj.children.push(childName);
  parentObj.childrenAges.push(childAge);
}

function addParentAuthorizedAdult_(parentObj, authorizedAdult) {
  Logger.log('Adding authorized adult to array...');
  parentObj.authorizedAdults.push(authorizedAdult);
}

function toggleNewVisitor_(parentObj) {
  Logger.log('New visitor changed from ' + parentObj.newVisitor + ' to ' + !parentObj.newVisitor);
  parentObj.newVisitor = parentObj.newVisitor === 0 ? 1 : 0;
}

function createNewParent_(parentName, addr, phone) {
  var newParentObj = getNewParentObject_();
  addParentName_(newParentObj, parentName);
  addAddress_(newParentObj, addr);
  addParentPhoneNumber_(newParentObj, phone);
  return newParentObj;
}

function getTitleArray_(itemsArray) {
  Logger.log('Populating title array...');
  var titleArray = [];
  var length = itemsArray.length;
  for (var i = 0; i < length; i++) {
    titleArray[i] = itemsArray[i].getTitle();
  }
  Logger.log('Title array populated.');
  return titleArray;
}

function validatePhoneNumber_(phoneNumber) {

}

function getParentInfoFromSheet_() {
  Logger.log('Retrieving spreadsheet...');
  var sheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/178g7gcZsdIGRUNhPXGugV54qvQmgXaapFV8Dw3qScLU/edit#gid=0').getActiveSheet();
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var parentObj = {};
  var parentObjArray = [];
  Logger.log('Retrieving parent data...');
  for (var i = 2; i <= lastRow; i++) {
    var values = sheet.getRange(i, 1, 1, 7).getValues();
    if (values[0][0] == "") {
      if (values[0][3] != "") {
        addParentChild_(parentObj, values[0][3], values[0][4]);
      }
      if (values[0][5] != "") {
        addParentAuthorizedAdult_(parentObj, values[0][5]);
      }
    } else {
      parentObjArray.push(parentObj);
      parentObj = getNewParentObject_();
      parentObj.name = values[0][0];
      parentObj.phoneNumber = values[0][1];
      parentObj.address = values[0][2];
      addParentChild_(parentObj, values[0][3], values[0][4]);
      addParentAuthorizedAdult_(parentObj, values[0][5]);
      parentObj.newVisitor = values[0][6];
    }
  }
  parentObjArray.push(parentObj);
  parentObjArray.shift();
  Logger.log('Parent data retrieved!');
  return parentObjArray;
}

function storeParentInfoToSheet_(parentObj) {
  Logger.log('Retrieving spreadsheet...');
  var sheet = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/178g7gcZsdIGRUNhPXGugV54qvQmgXaapFV8Dw3qScLU/edit#gid=0').getActiveSheet();
  var lastRow = sheet.getLastRow() + 1;
  var lastCol = sheet.getLastColumn();
  Logger.log('Storing parent data...');
  sheet.getRange(lastRow, 1).setValue(parentObj.name);
  sheet.getRange(lastRow, 2).setValue(parentObj.phoneNumber);
  sheet.getRange(lastRow, 3).setValue(parentObj.address);
  var childLength = parentObj.children.length;
  for (var i = 0 ; i < childLength; i++) {
    sheet.getRange(lastRow + i, 4).setValue(parentObj.children[i]);
    sheet.getRange(lastRow + i, 5).setValue(parentObj.childrenAges[i]);
  }
  var authLength = parentObj.authorizedAdults.length;
  for (var x = 0; x < authLength; x++) {
    sheet.getRange(lastRow + x, 6).setValue(parentObj.authorizedAdults[x]);
  }
  sheet.getRange(lastRow, 7).setValue(parentObj.newVisitor);
  Logger.log('Parent data stored!');
}

function processSubmit() {
  Logger.log('Retrieving form...');
  var form = FormApp.openByUrl('https://docs.google.com/forms/d/1hVcxzDQ1QR2_y2v6JoldWZ90GtQS986UU4WE9qcOboA/edit');
  var items = form.getItems();
  var titles = getTitleArray_(items);
  var myForm = getFormObject_(form, items, titles, form.getResponses().pop());
  Logger.log('Form object created.');
  var parents = getParentInfoFromSheet_();
}












