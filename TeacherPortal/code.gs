/*
Author/Developer : Jeromy Coburn
Date : 1 / 16 / 2016
File name : Code.gs
Script name : TeacherPortalScript
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
  var item_to_return;
  for(var i = 0; i < items_array.length; i++){
    if(items_array[i].getTitle() == search_key){
      item_to_return = items_array[i];
      break;
    }
  }
  return item_to_return;
}

function getLatestResponse_(form){
  var response_array = form.getResponses();
  var last_index = response_array.length - 1;
  return response_array[last_index];
}

function sendTextMessage_(phone_number, message){
  var phone_number_email = phone_number.trim().concat("@vtext.com");
  GmailApp.sendEmail(phone_number_email, "", message);
}

function callUsher_(class_name){
  
  //Twilio code would go here
  sendTextMessage_("9312602645", ("Your assistance has been requested in " + class_name + "."));
  GmailApp.sendEmail("ajcoburn88@gmail.com", "Call Usher Used", "Usher has been called to " + class_name + ".");
}

function callSecurity_(class_name){
  
  //Twilio code would go here
  sendTextMessage_("9312602645", ("SECURITY ASSISTANCE IS REQUIRED IN " + class_name + "!"));
  sendTextMessage_("9312602645", ("SECURITY CALL PLACED FOR " + class_name + "!"));
  GmailApp.sendEmail("ajcoburn88@gmail.com", "Call Security Used", ("Security call placed for " + class_name + "."));
}

function callParent_(child_name, phone_number, class_name){
  sendTextMessage_(phone_number, (child_name + " needs your help in " + class_name + "."));
  GmailApp.sendEmail("ajcoburn88@gmail.com", "Call Parent Used", ("call parent used to for " + child_name + " in " + class_name + "."));
}

function getCallParentResponse_(response, items_array){
  var beelievers_response = getResponseForAnItem_(response, items_array, "Beelievers");
  var little_buddies_response = getResponseForAnItem_(response, items_array, "Little Buddies");
  var little_oaks_response = getResponseForAnItem_(response, items_array, "Little Oaks");
  var fusion_response = getResponseForAnItem_(response, items_array, "Fusion");
  
  if(beelievers_response != null){ return beelievers_response;}
  else if(little_buddies_response != null){ return little_buddies_response;} 
  else if(little_oaks_response != null){ return little_oaks_response;} 
  else if(fusion_response != null){ return fusion_response;}
  else {return null;}
}

function getCallParentPhoneNumber_(items_array, child_name){
  var child_name_item = findItem_(items_array, child_name);
  return child_name_item.getHelpText();
}

function getResponseForAnItem_(response, items_array, item_title){
  var item = findItem_(items_array, item_title);
  var item_response = response.getResponseForItem(item);
  if(item_response != null){
    return item_response.getResponse();
  } else {
    return null;
  }
}

function processResponse_(response, items_array){
  var selected_class = getResponseForAnItem_(response, items_array, "Which class are you teaching?");
  Logger.log("Selected class is : " + selected_class);
  var menu_selection = getResponseForAnItem_(response, items_array, "Menu");
  Logger.log("Menu selection is : " + menu_selection);
  if(menu_selection == "Call for Security (Intruder/child or classroom risk)"){
    callSecurity_(selected_class);
  } else if(menu_selection == "Call for Usher (Trouble reaching the parent)"){
    callUsher_(selected_class);
  } else if(menu_selection == "Call for Parent (i.e. child is unruly, presence of blood/tears, no diapers, etc.)"){
    var child_name = getCallParentResponse_(response, items_array);
    var phone_number = getCallParentPhoneNumber_(items_array, child_name);
    callParent_(child_name, phone_number, selected_class);
  } else {
    sendTextMessage_("9312602645", "invalid selection was processed on teacher portal");
  }
}

function myFunction() {
  var teacher_portal = FormApp.openByUrl("https://docs.google.com/forms/d/1fP3u6q3Z2mYCr0eyqzr74sJwpqQwZqoF1dE6fl-p6Qw/edit");
  
  var items_array = teacher_portal.getItems();
  
  var latest_response = getLatestResponse_(teacher_portal);
  
  processResponse_(latest_response, items_array);
  
}
