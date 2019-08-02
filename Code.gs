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

function getFormObject_(form, portal, items, portalItems, titles, portalTitles, response) {
  Logger.log('Creating form object...');
  try {
    return {
      form: form,
      teacherPortal: portal,
      items: items,
      portalItems: portalItems,
      titles: titles,
      portalTitles: portalTitles,
      response: response
    };
  } catch(e) {
    Logger.error(e)
    GmailApp.sendEmail('jcoburn88@outlook.com', 'FATAL ERROR', ('Form object creation failure! \nERROR: ' + e.message));
  }
}

function findItem_(myForm, searchKey, usePortal) {
  try {
    Logger.log('Returing requested item: ' + searchKey);
    if(usePortal){
      return myForm.portalItems[myForm.portalTitles.indexOf(searchKey)];
    } else {
      return myForm.items[myForm.titles.indexOf(searchKey)];
    }
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
  parentObj.newVisitor = !parentObj.newVisitor;
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

function formatPhoneNumber_(phoneNumber) {
  Logger.log('Formatting phone number...');
  var phoneNumberArray = phoneNumber.split('');
  var length = phoneNumberArray.length;
  var formattedPhoneNumber = '';
  for (var i = 0; i < length; i++) {
    if (phoneNumberArray[i].match(/\d/)) {
      formattedPhoneNumber += phoneNumberArray[i];
    }
  }
  if (formattedPhoneNumber.length < 10) {
    Logger.error('Phone number too short, returning -1');
    return -1;
  }
  Logger.log('Phone number successfully formatted.');
  return formattedPhoneNumber;
}

function getFolderByName_(folderName) {
  Logger.log('Looking for folder...');
  var folderIter = DriveApp.getFoldersByName(folderName);
  while(folderIter.hasNext()) {
    var currFolder = folderIter.next();
    if(currFolder.getName() === folderName) {
      Logger.log('Folder found!');
      return currFolder;
    }
  }
  Logger.log('Could not find folder');
  return -1;
}

function getFileByName_(fileName) {
  Logger.log('Looking for file...');
  var fileIter = DriveApp.getFilesByName(fileName);
  while(fileIter.hasNext()) {
    var currFile = fileIter.next();
    if(currFile.getName() === fileName) {
      Logger.log('File found!');
      return currFile;
    }
  }
  Logger.log('Could not find file');
  return -1;
}

function addChildrenToForms_(myForm, parentObj) {
  var length = parentObj.children.length;
  var callParentItemName;
  var callParentItem;
  var choices;
  for(var i = 0; i < length; i++) {
    myForm.teacherPortal.addPageBreakItem().setTitle(parentObj.children[i]).setHelpText(parentObj.phoneNumber);
    callParentItemName = (parentObj.childrenAges[i].split('(')[1].split(')')[0] + ' Children');
    callParentItem = findItem_(myForm, callParentItemName, true);
    callParentItem = callParentItem.asMultipleChoiceItem();
    choices = callParentItem.getChoices();
    if(choices[0].getValue() === 'EVERYONE\'S SIGNED OUT!'){
      choices.pop();
    }
    choices.push(callParentItem.createChoice(parentObj.children[i]));
    callParentItem.setChoices(choices);
  }
}

function addParentObjectToForm_(myForm, parentObj) {
  Logger.log('Adding parent object to form...');
  var signOutItem = findItem_(myForm, 'Parent Name').asListItem();
  Logger.log('Adding new section');
  myForm.form.addPageBreakItem().setTitle(parentObj.name + '\'s Child(ren)').setGoToPage(FormApp.PageNavigationType.SUBMIT);
  Logger.log('Adding new checkbox item');
  var parentSignOutItem = myForm.form.addCheckboxItem().setTitle('Only *' + parentObj.authorizedAdults.join(' & ') + '* can pick up!').setChoiceValues(parentObj.children);
  addChildrenToForms_(myForm, parentObj);
  Logger.log('Populating sign out choices...');
  var choices = signOutItem.getChoices();
  if(choices.length === 1 && choices[0].getValue() === 'EVERYONE\'S SIGNED OUT!') {
    choices.pop();
  }
  choices.push(signOutItem.createChoice(parentObj.name));
  signOutItem.setChoices(choices);
}

function signIn_(myForm, parentObj) {
  Logger.log('Signing in...');
  var date = Utilities.formatDate(new Date(), 'GMT-5', 'YYYY-MM-dd');
  var signInSheet = getFileByName_(date);
  storeParentInfoToSheet_(parentObj, SpreadsheetApp.openById(signInSheet.getId()).getActiveSheet());
  addParentObjectToForm_(myForm, parentObj);
  Logger.log('Signed in');
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
  Logger.log('Parent data retrieved...returning array of parent objects.');
  return parentObjArray;
}

function storeParentInfoToSheet_(parentObj, sheet) {
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

function populateParentNameDropdown_(myForm, parents) {
  Logger.log('Populating parent name dropdown list...');
  var parentNameDropdownItem = findItem_(myForm, 'Select your name').asListItem();
  var parentNames = ['I can\'t find my name!'];
  var length = parents.length;
  for(var i = 0; i < length; i++) {
    parentNames.push(parents[i].name);
  }
  parentNameDropdownItem.setChoiceValues(parentNames);
  Logger.log('Parent name dropdown list populated.');
}

function resetForm_(myForm) {
  Logger.log('Resetting form...');
  findItem_(myForm, 'Select your name').asListItem().setChoiceValues(['EVERYONE\'S SIGNED OUT!']);
  var signOutItem = findItem_(myForm, 'Parent Name').asListItem();
  signOutItem.setChoiceValues(['EVERYONE\'S SIGNED OUT!']);
  var lastIndex = signOutItem.getIndex();
  var length = myForm.items.length;
  Logger.log('last index: ' + lastIndex);
  for(var i = length - 1; i > lastIndex; i--) {
    Logger.log('deleting index: ' + i);
    myForm.form.deleteItem(i);
  }
  findItem_(myForm, 'Beelievers Children', true).asMultipleChoiceItem().setChoiceValues(['EVERYONE\'S SIGNED OUT!']);
  findItem_(myForm, 'Little Buddies Children', true).asMultipleChoiceItem().setChoiceValues(['EVERYONE\'S SIGNED OUT!']);
  findItem_(myForm, 'Little Oaks Children', true).asMultipleChoiceItem().setChoiceValues(['EVERYONE\'S SIGNED OUT!']);
  var fusionItem = findItem_(myForm, 'Fusion Children', true).asMultipleChoiceItem();
  fusionItem.setChoiceValues(['EVERYONE\'S SIGNED OUT!']);
  lastIndex = fusionItem.getIndex();
  length = myForm.portalItems.length;
  for(var i = length - 1; i > lastIndex; i--) {
    Logger.log('deleting portal index: ' + i);
    myForm.teacherPortal.deleteItem(i);
  }
}

function dailySetup() {
  Logger.log('Retrieving form...');
  var form = FormApp.openByUrl('https://docs.google.com/forms/d/1hVcxzDQ1QR2_y2v6JoldWZ90GtQS986UU4WE9qcOboA/edit');
  var portal = FormApp.openByUrl('https://docs.google.com/forms/d/1bxGnpQYwlMZYGkPKstjHJe3lZolTFH1k-TyV_Hgyu2M/edit');
  var items = form.getItems();
  var portalItems = portal.getItems();
  var myForm = getFormObject_(form, portal, items, portalItems, getTitleArray_(items), getTitleArray_(portalItems), form.getResponses().pop() || null);
  Logger.log('Form object created.');
  resetForm_(myForm);
  populateParentNameDropdown_(myForm, getParentInfoFromSheet_());
  var date = Utilities.formatDate(new Date(), 'GMT-5', 'YYYY-MM-dd');
  var fileIter = DriveApp.getFilesByName(date);
  var exists = false;
  while(fileIter.hasNext()){
    var nextFile = fileIter.next();
    if(nextFile.getName() === date){
      exists = true;
      break;
    }
  }
  if(!exists){
    SpreadsheetApp.create(date);
  }
//  DriveApp.getFileById(origFile.getId()).makeCopy(date, getFolderByName_('SignInSheets'));
//  DriveApp.removeFile(DriveApp.getFileById(origFile.getId()));
}

function processSubmit() {
  Logger.log('Retrieving form...');
  var form = FormApp.openByUrl('https://docs.google.com/forms/d/1hVcxzDQ1QR2_y2v6JoldWZ90GtQS986UU4WE9qcOboA/edit');
  var portal = FormApp.openByUrl('https://docs.google.com/forms/d/1bxGnpQYwlMZYGkPKstjHJe3lZolTFH1k-TyV_Hgyu2M/edit');
  var items = form.getItems();
  var portalItems = portal.getItems();
  var myForm = getFormObject_(form, portal, items, portalItems, getTitleArray_(items), getTitleArray_(portalItems), form.getResponses().pop());
  Logger.log('Form object created.');
  var parents = getParentInfoFromSheet_();
  
  signIn_(myForm, parents[parents.length - 1]);
}












