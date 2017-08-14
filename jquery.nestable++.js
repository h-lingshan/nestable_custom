/*jslint browser: true, devel: true, white: true, eqeq: true, plusplus: true, sloppy: true, vars: true*/
/*global $ */

/*************** General ***************/
var updateOutput = function (e) {
  var list = e.length ? e : $(e.target),
      output = list.data('output');
  if (window.JSON) {
    if (output) {
      output.val(window.JSON.stringify(list.nestable('asNestedSet')));
    }
  } else {
    alert('JSON browser support required for this page.');
  }
};

var nestableList = $("#nestable > .dd-list");

/***************************************/


/*************** Delete ***************/

var deleteFromMenuHelper = function (target) {
  if (target.data('new') == 1) {
    // if it's not yet saved in the database, just remove it from DOM
    target.fadeOut(function () {
      target.remove();
      updateOutput($('#nestable').data('output', $('#json-output')));
    });
  } else {
    // otherwise hide and mark it for deletion
    target.appendTo(nestableList); // if children, move to the top level
    target.data('deleted', '1');
    target.fadeOut();
  }
};

var deleteFromMenu = function () {
  var targetId = $(this).data('owner-id');
  var target = $('[data-id="' + targetId + '"]');

  var result = confirm("Delete " + target.data('label') + " and all its subitems ?");
  if (!result) {
    return;
  }

  // Remove children (if any)
  target.find("li").each(function () {
    deleteFromMenuHelper($(this));
  });

  // Remove parent
  deleteFromMenuHelper(target);

  // update JSON
  updateOutput($('#nestable').data('output', $('#json-output')));
};

/***************************************/


/*************** Edit ***************/

var menuEditor = $("#menu-editor");
var editButton = $("#editButton");
var editInputName = $("#editInputName");
var editInputSlug = $("#editInputSlug");
var editNextType = $("#editNextType");
var currentEditName = $("#currentEditName");

// Prepares and shows the Edit Form
var prepareEdit = function () {
  var targetId = $(this).data('owner-id');
  var target = $('[data-id="' + targetId + '"]');

  editInputName.val(target.data("label"));
  editInputSlug.val(target.data("to_web"));
  editNextType.val(target.data("next_type"));
  currentEditName.html(target.data("label"));
  editButton.data("owner-id", target.data("id"));

  console.log("[INFO] Editing Menu Item " + editButton.data("owner-id"));

  menuEditor.fadeIn();
};

// Edits the Menu item and hides the Edit Form
var editMenuItem = function () {
  var targetId = $(this).data('owner-id');
  var target = $('[data-id="' + targetId + '"]');

  var newName = editInputName.val();
  var newSlug = editInputSlug.val();
  var newNextType = editNextType.val();

  target.data("label", newName);
  target.data("to_web", newSlug);
  target.data("next_type",newNextType);

  target.find("> .dd-handle").html(newName);

  menuEditor.fadeOut();

  // update JSON
  updateOutput($('#nestable').data('output', $('#json-output')));
};

/***************************************/


/*************** Add ***************/

var newIdCount = 1;

var addToMenu = function () {
  var newName = $("#addInputName").val();
  var newSlug = $("#addInputSlug").val();
  var newNextType = $("#addNextType").val();
  //var newId = 'new-' + newIdCount;
  var newId = newIdCount;
  if ($("li").last().attr("data-id")==undefined)
    newId = 1;
  else
    newId = parseInt($("li").last().attr("data-id"))+1
  
  nestableList.append(
    '<li class="dd-item" ' +
    'data-id="' + newId + '" ' +
    'data-label="' + newName + '" ' +
    //'data-name="' + newName + '" ' +
    'data-to_web="' + newSlug + '" ' +
    'data-next_type="' + newNextType + '" ' +
    //'data-new="1" ' +
    'data-deleted="0" '+
    '>' +
    '<div class="dd-handle">' + newName + '</div> ' +
    '<span class="button-delete btn btn-default btn-xs pull-right" ' +
    'data-owner-id="' + newId + '"> ' +
    '<i class="fa fa-times-circle-o" aria-hidden="true"></i> ' +
    '</span>' +
    '<span class="button-edit btn btn-default btn-xs pull-right" ' +
    'data-owner-id="' + newId + '">' +
    '<i class="fa fa-pencil" aria-hidden="true"></i>' +
    '</span>' +
    '</li>'
  );

  newIdCount++;

  // update JSON
  updateOutput($('#nestable').data('output', $('#json-output')));

  // set events
  $("#nestable .button-delete").on("click", deleteFromMenu);
  $("#nestable .button-edit").on("click", prepareEdit);
};

var loadFromJson = function(){
   $.ajax({
     url: 'temp.json',
     type: 'get',
     dataType: 'json',
     error: function(data){
     },
     success: function(data){
       nestableList.nestable({
         group: 1,
         json:  data,
         contentCallback: function(item) {
           return item.id;
         }
       })
      // update JSON      
      updateOutput($('#nestable').data('output', $('#json-output')));
      // set events
     $("#nestable .button-delete").on("click", deleteFromMenu);
     $("#nestable .button-edit").on("click", prepareEdit);
     }     
  });
};


/***************************************/



$(function () {



  // output initial serialised data
  updateOutput($('#nestable').data('output', $('#json-output')));

  // set onclick events
  editButton.on("click", editMenuItem);

  $("#nestable .button-delete").on("click", deleteFromMenu);

  $("#nestable .button-edit").on("click", prepareEdit);

  $("#menu-editor").submit(function (e) {
    e.preventDefault();
  });

  $("#menu-add").submit(function (e) {
    e.preventDefault();
    addToMenu();
  });

  $("#importFile").click(function(){
    loadFromJson();
  })
  
  $("#save_to_file").click(function(){
    var text = $("#json-output").val();
    var blob = new Blob([text], {type: "json/plain"});
    var a = document.createElement('a');
        a.download = "temp.json";
        a.target   = '_blank'
   
    if (window.navigator.msSaveBlob) {
       // for IE
       window.navigator.msSaveBlob(blob, name)
    }
    else if (window.URL && window.URL.createObjectURL) {
       // for Firefox
      a.href = window.URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    else if (window.webkitURL && window.webkitURL.createObject) {
      // for Chrome
      a.href = window.webkitURL.createObjectURL(blob);
      a.click();
    }
    else {
      // for Safari
      window.open('data:' + mimeType + ';base64,' + window.Base64.encode(content), '_blank');
    }
  })  
});

