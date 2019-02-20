/*
Author/Developer : Jeromy Coburn
Date : 1 / 16 / 2016
File name : Code.gs
Script name : SignInFormScript
Purpose : Custom modification to multiple Google Forms to allow
          smooth operation as a sign in/out kiosk and teacher portal
          for Living Hope Church children's 
          
          
      ****************************************************************************************************
      *    Copyright : This code shall not be used, distributed, or modified, without written consent    * 
      *                from both the developer and Living Hope Church.  Violation of this will result    *
      *                in copyright infringement, theft of intellectual property, and unauthorized       *
      *                access to church accounts.                                                        *
      ****************************************************************************************************
*/




function findItem_(items_array, search_key){
  //loops through all items to find a match
  //null is returned otherwise
  /*
    NOTE: should never return null, and so is never checked.
    If this were a higher scale project, error checking would be 
    more prevalent, however, the small\local nature of this script
    has allowed this aspect to be overlooked for the time being.
    Should this ever go beyond, more extensive error checks will be
    put in place.
  */
  var item_to_return = null;
  for(var i = 0; i < items_array.length; i++){
    if(items_array[i].getTitle() == search_key){
      item_to_return = items_array[i];
      break;
    }
  }
  return item_to_return;
}

function sendTextMessage_(phone_number, message){
  var phone_number_email = phone_number.trim().concat("@vtext.com");
  GmailApp.sendEmail(phone_number_email, "", message);
}

function getParentName_(form_response, items_array){
  //get the item so the response can be found and returned
  var parent_name_item = findItem_(items_array, "Parent/Guardian Name");
  return form_response.getResponseForItem(parent_name_item).getResponse(); //should return the Parent/Guardian name
}

function getPhoneNumber_(form_response, items_array){
  //gets the phone number item so the response can be returned
  var phone_number_item = findItem_(items_array, "Phone Number(so we can text you if your child needs you)");
  return form_response.getResponseForItem(phone_number_item).getResponse(); //should return the phone number given
}

function combineChildNameAndAgeArrays_(names, ages){
  var combined_array = [];
  for(var i = 0; i < names.length; i++){
    combined_array.push(names[i].concat(" (" + ages[i] + ")"));
  }
  return combined_array;
}

function updateArray_(current_array, new_array){
  for(var i = 0; i < new_array.length; i++){
    current_array.push(new_array[i]);
  }
}

function extractValuesFromChoiceArray_(array){
  var value_array = [];
  for(var i = 0; i < array.length; i++){
    value_array.push(array[i].getValue());
  }
  return value_array;
}

function storeChildrenInTeacherPortal_(teacher_portal, child_name_array, child_age_array, phone_number, num_children){
  var portal_items = teacher_portal.getItems();
  var length = child_name_array.length;
  var child_name_item;
  var choice_array = [];
  for(var i = 0; i < length; i++){
    child_name_item = findItem_(portal_items, child_age_array[i]).asMultipleChoiceItem();
    choice_array = child_name_item.getChoices();
    choice_array = checkForEmptyChoiceArray_(choice_array);
    choice_array.push(child_name_item.createChoice(child_name_array[i], FormApp.PageNavigationType.SUBMIT));
    teacher_portal.addPageBreakItem().setTitle(child_name_array[i]).setHelpText(phone_number);
    child_name_item.setChoices(choice_array);
  }
}

function checkForEmptyChoiceArray_(choice_array){
  var length = choice_array.length;
  if(length == 1){
    if(choice_array[0].getValue() == "Option 1" || choice_array[0].getValue() == "EVERYONE'S SIGNED OUT!"){
     choice_array = [];
    }
  }
  return choice_array;
}

function addChildNameToArrayFromAttendanceForm_(form_response, multiple_children_page_break, items_array, child_name_array){
  var child_index = multiple_children_page_break.getIndex(); //gets index of page break item so the following 3 questions can be accessed appropriately
  child_index++; //gets to the first question in this section of the form
  var child_name = form_response.getResponseForItem(items_array[child_index]).getResponse(); //gets the response value from the item response at the indicated index
  child_name_array.push(child_name);
}

function addChildAgeToArrayFromAttendanceForm_(form_response, multiple_children_page_break, items_array, child_age_array){
  var age_index = multiple_children_page_break.getIndex(); //gets index of page break item so the following 3 questions can be accessed appropriately
  age_index += 2; //gets to the second question in this section of the form
  var child_age = form_response.getResponseForItem(items_array[age_index]).getResponse(); //gets the response value from the item response at the indicated index
  child_age = child_age.split("(")[1].split("class")[0].trim(); //only gets class name for child age array
  child_age_array.push(child_age);
}

function noMoreChildrenToAdd_(form_response, multiple_children_page_break, items_array){
  if(multiple_children_page_break.getTitle() == "Tenth Child"){ return true; } //max limit has been reached and no more can be added
 
  var add_another_index = multiple_children_page_break.getIndex(); //will be used to find the 'Add Another' question in the items array
  add_another_index += 3;
  var add_another_response = form_response.getResponseForItem(items_array[add_another_index]).getResponse(); //gets either 'no' or 'yes' and returns true or false respectively
  
  if(add_another_response == "No") {return true;}
  
  return false;
}

function addChildNamesAndAgeToArray_(form_response, items_array, child_name_array, child_age_array){
  //array for page break titles to make page break item access easier to iterate through
  var page_break_title_array = ["First Child", "Second Child", "Third Child", "Fourth Child", "Fifth Child", 
                                "Sixth Child", "Seventh Child", "Eighth Child", "Ninth Child", "Tenth Child"]; //multi-line array declaration
  
  var multiple_children_page_break_item;
  var num_children = 0;
  for(var i = 0; i < page_break_title_array.length; i++){
    multiple_children_page_break_item = findItem_(items_array, page_break_title_array[i]);
    addChildNameToArrayFromAttendanceForm_(form_response, multiple_children_page_break_item, items_array, child_name_array);
    addChildAgeToArrayFromAttendanceForm_(form_response, multiple_children_page_break_item, items_array, child_age_array);
    num_children++;
    if(noMoreChildrenToAdd_(form_response, multiple_children_page_break_item, items_array)){break; } //if there are no more children to add, the loop ends
  }
  return num_children;
}

function addSignOutChoices_(form, sign_out_list_item, parent_name, child_name_array, child_age_array, phone_number){
  var parent_child_section = form.addPageBreakItem().setTitle(parent_name).setHelpText(phone_number).setGoToPage(FormApp.PageNavigationType.SUBMIT);
  var parent_sign_out_section = form.addCheckboxItem().setTitle(parent_name + "'s Child(ren)");//.setChoiceValues(child_name_array);
  var choice = [];
  for(var i = 0; i < child_name_array.length; i++){
    choice.push(parent_sign_out_section.createChoice(child_name_array[i] + " (" + child_age_array[i] + ")"));
  }
  parent_sign_out_section.setChoices(choice);
  var sign_out_list_choices = sign_out_list_item.asListItem().getChoices();
  if(sign_out_list_choices[0].getValue() == "EVERYONE'S SIGNED OUT!"){
    sign_out_list_choices = [];
  }
  sign_out_list_choices.push(sign_out_list_item.asListItem().createChoice(parent_name, parent_child_section));
  sign_out_list_item.asListItem().setChoices(sign_out_list_choices);
}

function updateSignInForm_(form, form_response, teacher_portal, items_array, child_name_array, child_age_array){
  var parent_name = getParentName_(form_response, items_array);
  var phone_number = getPhoneNumber_(form_response, items_array);
  var num_children_signed_in = addChildNamesAndAgeToArray_(form_response, items_array, child_name_array, child_age_array);
  var sign_out_item = findItem_(items_array, "Your Name");
  
  addSignOutChoices_(form, sign_out_item, parent_name, child_name_array, child_age_array, phone_number);
  storeChildrenInTeacherPortal_(teacher_portal, child_name_array, child_age_array, phone_number, num_children_signed_in);
  
  var message = arrayToString_(child_name_array) + "signed in.\n\nPlease keep your phone handy\nin case your child needs help.\n\nRemember to sign them out before leaving.";
  sendTextMessage_(phone_number, message);
}

function arrayToString_(array){
  //iterates through array placing items in a readable comma separated format
  var len = array.length;
  if(len == 1){return (array[0] + " is ");}
  
  var str_to_return = array[0];
  for(var i = 1; i < len; i++){
    if(i == len-1){
      str_to_return = str_to_return.concat(" & " + array[i] + " are ");
    } else {
      str_to_return = str_to_return.concat(", " + array[i]);
    }
  }
  return str_to_return;
}

function getParentNameSignOut_(form_response, items_array){
  //iterate the items and find the parent name from the sign out dropdown (list item) choice
  var sign_out_item = findItem_(items_array, "Your Name");
  var parent_sign_out_name = form_response.getResponseForItem(sign_out_item).getResponse(); //sets the parent sign out name to the result of the name question in the sign out section
  return parent_sign_out_name;
}

function removeChildrenFromSignOutList_(form, form_response, teacher_portal, sign_out_item, phone_number, parent_item){
  var sign_out_choices = sign_out_item.asCheckboxItem().getChoices(); //array of choices for comparison/removal
  var sign_out_response = form_response.getResponseForItem(sign_out_item).getResponse(); //gets all the children under that parent that are being signed out
  var number_of_children_signed_out = 0;
  //iterate through the choices and responses, removing those that are selected
  for(var i = 0; i < sign_out_choices.length; i++){
    for(var x = 0; x < sign_out_response.length; x++){
      if(sign_out_choices[i].getValue() == sign_out_response[x]){
        removeChildFromTeacherPortalAfterSignOut_(teacher_portal, sign_out_choices[i].getValue());
        sign_out_choices.splice(i, 1);
        i = 0;
        number_of_children_signed_out++;
      }
    }
  }
  if(sign_out_choices.length == 0){
    sign_out_choices.push(sign_out_item.asCheckboxItem().createChoice("All children signed out"));
  }
  sign_out_item.asCheckboxItem().setChoices(sign_out_choices);
  var message = number_of_children_signed_out + " child(ren) have been signed out.\n\nThank you for coming to Living Hope Church!\n\n*DIDN'T SIGN THEM OUT? COME CHECK WITH US*";
  sendTextMessage_(phone_number, message);
}

function removeChildChoiceFromCallParent_(call_parent_item, child_name){
  var children_name_choices = call_parent_item.asMultipleChoiceItem().getChoices();
  for(var i = 0; i < children_name_choices.length; i++){
    if(children_name_choices[i].getValue() == child_name){
      children_name_choices.splice(i, 1);
      break;
    }
  }
  if(children_name_choices.length == 0){
    children_name_choices.push(call_parent_item.asMultipleChoiceItem().createChoice("EVERYONE'S SIGNED OUT!"));
  }
  call_parent_item.asMultipleChoiceItem().setChoices(children_name_choices);
}

function separateChildNameAndAge_(child_name_and_age_str){
  var paren_delim_str = child_name_and_age_str.split("(");
  var name = paren_delim_str[0].trim();
  var class = paren_delim_str[1].split(")")[0].trim();
  return [name, class];
}

function removeChildFromTeacherPortalAfterSignOut_(teacher_portal, child_name_and_age){
  //finds child in the teacher portal form and removes them once they've been signed out on the attendance form
  var teacher_portal_items = teacher_portal.getItems();
  var child_name_and_age = separateChildNameAndAge_(child_name_and_age);
  var call_for_parent_item = findItem_(teacher_portal_items, child_name_and_age[1]);
  removeChildChoiceFromCallParent_(call_for_parent_item, child_name_and_age[0]);
  Logger.log("remove item : " + child_name_and_age[0]);
  teacher_portal.deleteItem(findItem_(teacher_portal_items, child_name_and_age[0]));
}

function allChildrenSignedOutForParent_(sign_out_item){
  var sign_out_choices = sign_out_item.asCheckboxItem().getChoices(); //gets remaining choices for children to sign out
  if(sign_out_choices[0].getValue() == "All children signed out"){
    return true; //no sign out options left, all children for this parent have been signed out
  }
  return false; //some children still left to sign out for parent
}

function removeParentNameFromSignOutList_(parent_name, sign_out_item){
  var sign_out_choices = sign_out_item.asListItem().getChoices();
  for(var i = 0; i < sign_out_choices.length; i++){
    if(sign_out_choices[i].getValue() == parent_name){
      sign_out_choices.splice(i,1);
      break;
    }
  }
  if(sign_out_choices.length == 0){
    sign_out_choices.push(sign_out_item.asListItem().createChoice("EVERYONE'S SIGNED OUT!"));
  }
  sign_out_item.asListItem().setChoices(sign_out_choices);
}

function resetSignInOutForm(form, items_array){
  var sign_out_item = findItem_(items_array, "Your Name");
  var start_index = sign_out_item.getIndex();
  var end_index = items_array.length;
  while(end_index > start_index){
    items_array.splice(end_index,1);
    end_index--;
  }
}

function removeParentSectionFromSignInForm_(form, parent_name, items_array, parent_sign_out_item){
  form.deleteItem(findItem_(items_array, parent_name));
  form.deleteItem(parent_sign_out_item);
}

function updateSignOutForm_(form, form_response, teacher_portal, items_array, child_name_array, child_age_array){
  var parent_name = getParentNameSignOut_(form_response, items_array); //string of the parent's name
  var parent_sign_out_item = findItem_(items_array, (parent_name + "'s Child(ren)"));
  var phone_number = findItem_(items_array, parent_name).getHelpText();
  removeChildrenFromSignOutList_(form, form_response, teacher_portal, parent_sign_out_item, phone_number, findItem_(items_array, parent_name)); //removes the children to be signed out from the appropriate section
  if(allChildrenSignedOutForParent_(parent_sign_out_item)){
    removeParentNameFromSignOutList_(parent_name, findItem_(items_array, "Your Name")); //removes the parent name from the list of sign out choices
    removeParentSectionFromSignInForm_(form, parent_name, items_array, parent_sign_out_item);
  }
}

function isSigningIn_(form_response, items_array){
  var sign_in_out_item = findItem_(items_array, "Sign in/out");
  var sign_in_out_response = form_response.getResponseForItem(sign_in_out_item).getResponse(); //gets the response for the sign in or out selection
  
  if(sign_in_out_response == "Sign In"){ return true; } //returns true for sign in
  return false; //returns false for sign out
}

function getLatestResponse_(form){
  var response_array = form.getResponses();
  return response_array[response_array.length - 1]; //the last entry in the response array which is the most recent
}

function myFunction() {
  var attendance_form = FormApp.openByUrl("https://docs.google.com/forms/d/1Kp9dx5pb9Yqaws702sBjA1CmIWaP9BxJBQcTafKrt4I/edit");
  var teacher_portal = FormApp.openByUrl("https://docs.google.com/forms/d/1fP3u6q3Z2mYCr0eyqzr74sJwpqQwZqoF1dE6fl-p6Qw/edit");
  
  var latest_response = getLatestResponse_(attendance_form);
  var attendance_item_array = attendance_form.getItems();
  
  //array initialization
  var child_name_array = []; 
  var child_age_array = [];
  
  if(isSigningIn_(latest_response, attendance_item_array)){
    // executes if signing in
    updateSignInForm_(attendance_form, latest_response, teacher_portal, attendance_item_array, child_name_array, child_age_array);
    
  } else {
    // executes if signing out
    updateSignOutForm_(attendance_form, latest_response, teacher_portal, attendance_item_array, child_name_array, child_age_array);
  }
}
