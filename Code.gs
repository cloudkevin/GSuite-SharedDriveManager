function onOpen(){
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Manage Shared Drives')
  .addItem('Update Last Modified Date', 'LastModifiedDate')
  .addItem('Add Organizer Permissions', 'AddPermissions')
  .addItem('Purge Drive', 'PurgeDrive')
  .addItem('Get Drive Size', 'GetDriveSize')
  .addToUi();
}

function LastModifiedDate(){
  var currCell = SpreadsheetApp.getActiveRange().getValue();
  var updateCell = String.fromCharCode(SpreadsheetApp.getActiveRange().getA1Notation().split('')[0].charCodeAt(0)+3)+SpreadsheetApp.getActiveRange().getA1Notation().substring(1);
  SpreadsheetApp.getActiveSheet().getRange(updateCell).setValue(DriveApp.getFolderById(currCell).getLastUpdated());
}

function AddPermissions(){
  var currCell = SpreadsheetApp.getActiveRange().getValue();
  var args = {supportsTeamDrives: true, sendNotificationEmails: false};
  var response = SpreadsheetApp.getUi().prompt('Enter target user email: ');
  var newPermissions = {value: response.getResponseText(), type: 'user', role: 'organizer'};
  
  if (response.getResponseText() != ''){
    Drive.Permissions.insert(newPermissions, currCell, args);
  }
}

function PurgeDrive(){
  var ui = SpreadsheetApp.getUi();
  var currCell = SpreadsheetApp.getActiveRange().getValue();
  var updateCell = String.fromCharCode(SpreadsheetApp.getActiveRange().getA1Notation().split('')[0].charCodeAt(0)+5)+SpreadsheetApp.getActiveRange().getA1Notation().substring(1);
  var args = {supportsAllDrives: true, includeItemsFromAllDrives: true, corpora: 'drive', driveId: currCell};
  var files = DriveApp.getFolderById(currCell).getFiles();
  var folders = DriveApp.getFolderById(currCell).getFolders();
  var response = ui.alert('Are you sure you want to delete everything from this Drive?', ui.ButtonSet.OK_CANCEL);
  Logger.log('DriveID: '+currCell);
  SpreadsheetApp.getActiveSheet().getRange(updateCell).setValue('In Progress');
  if (response == ui.Button.OK){
    while (folders.hasNext()) {
    var folder = folders.next();
    var files = folder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      file.setTrashed(true);
    }
    folder.setTrashed(true);
  }
  SpreadsheetApp.getActiveSheet().getRange(updateCell).setValue('Purge Complete');
  } else if (response == ui.Button.CANCEL) {
    Logger.log('Action Cancelled');
    SpreadsheetApp.getActiveSheet().getRange(updateCell).setValue('');
  }
}

function GetDriveSize(){
  var currCell = SpreadsheetApp.getActiveRange().getValue();
  var updateCell = String.fromCharCode(SpreadsheetApp.getActiveRange().getA1Notation().split('')[0].charCodeAt(0)+6)+SpreadsheetApp.getActiveRange().getA1Notation().substring(1);
  var folders = DriveApp.getFolderById(currCell).getFolders();
  var files = DriveApp.getFolderById(currCell).getFiles();
  var size = 0
  var folder, file;
  
  while(files.hasNext()){
    file = files.next();
    size += file.getSize();
  }
  while (folders.hasNext()) {
    var folder = folders.next();
    var files = folder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      size += file.getSize();
    }
  }
  SpreadsheetApp.getActiveSheet().getRange(updateCell).setValue(formatSize(size));
}

//Helper Functions
function formatSize(a, b) {
  if(0 == a) return "0 Bytes";
  var c=1024,d=b||2, e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f = Math.floor(Math.log(a)/Math.log(c));
  return parseFloat((a/Math.pow(c,f)).toFixed(d))+ " " + e[f]
}
