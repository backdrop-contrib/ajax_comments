var commentbox = ".comment";
var ctrl = false;

/**
 * Attaches the ahah behavior to each ahah form element.
 */
Drupal.behaviors.ajax_comments = function(context) {
  $('#comment-form:not(.ajax-comments-processed)', context).addClass('ajax-comments-processed').each(function() {
    // prepare the form when the DOM is ready
    if ((Drupal.settings.rows_default == undefined) || (!Drupal.settings.rows_default)) {
      Drupal.settings.rows_default = $('textarea', $(this)).attr('rows');
    }
    $('textarea', $(this)).attr('rows', Drupal.settings.rows_default);
    if ((Drupal.settings.rows_in_reply == undefined) || (!Drupal.settings.rows_in_reply)) {
      Drupal.settings.rows_in_reply = Drupal.settings.rows_default;
    }
    if (Drupal.settings.always_expand_main_form == undefined) {
      Drupal.settings.always_expand_main_form = true;
    }
    
    $('.form-submit', $(this)).bind('mousedown', function(){ ajax_comments_update_editors(); });
    $('.form-submit', $(this)).bind('keydown', function(){ ajax_comments_update_editors(); });
    
    // initializing main form
    action = $(this).attr('action');

    // Creating title link
    title_element = $(this).parents(".box").find("h2,h3,h4");
    title = title_element.html();
    title_element.html('<a href="'+action+'" id="comment-form-title">'+title+'</a>');
    $(this).parents(".box").find(".content").attr('id','comment-form-content');

    // Expanding form if needed
    page_url = document.location.toString();
    fragment = '';
    if (page_url.match('#')) {
      fragment = page_url.split('#')[1];
    }

    if ((fragment != 'comment-form') && (!Drupal.settings.always_expand_main_form)) {
      // fast hide form
      $('#comment-form-content', context).hide();
    }
    else {
      $('#comment-form-title', context).addClass('pressed');
    }
    
    // Attaching event to title link
    $('#comment-form-title', context).click(reply_click);
    
    if(typeof(fix_control_size)!='undefined'){ fix_control_size(); };
  });
  
  $('.comment_reply a:not(.ajax-comments-processed)', context).addClass('ajax-comments-processed').each(function() {
    $(this).click(reply_click);
  });

  $('.comment_delete a:not(.ajax-comments-processed)', context).addClass('ajax-comments-processed').each(function() {
    $(this).click(delete_click);
  });

  // add Ctrl key listener for deletion feature
  $(window).keydown(function(e) {
    if(e.keyCode == 17) {
      ctrl = true;
    }
  });
  $(window).keyup(function(e) {
    ctrl = false;
  });
};

// Helper fnction for reply handler
function initForm(action, rows){
  // resizing and clearing textarea
  $('#comment-form textarea').attr('rows', rows);
  // $('#comment-form textarea').attr('value','');

  // clearing form
  $('#comment-form-content #comment-preview').empty();
  $('#comment-form .error').removeClass('error');

  // * getting proper form tokens

  // disabling buttons while loading tokens
  $('#comment-form .form-submit').attr('disabled','true');

  // specially for Opera browser
  a1 = action.replace('http:// ','');
  // getting token params (/comment/reply/x/p)
  var arr = a1.split('/');
  if (!arr[4]) arr[4] = '0';
  // sending ajax call to get the token
  var token = 0;
  $.ajax({
    type: "GET",
    url: Drupal.settings.basePath + "get_form_token/" + arr[3] + '/' + arr[4],
    success: function(form){
      // Going further
      initForm_setTokens(form);
    }
  });
  
  // now we can attach previously removed editors
  ajax_comments_attach_editors();
  // ...and show the form after everything is done
  ajax_comments_expand_form();
}

// Second helper function for Reply handler
function initForm_setTokens(form){
  action = $(form).attr('action');
  token = $("#edit-form-token", form).val();
  bid = $("input[name=form_build_id]", form).val();
  captcha = $(".captcha", form).html();

  // Refresh form tokens
  if (token) {
    $('#comment-form-content > #comment-form #edit-form-token').attr('value',token);
  }
  // ...and build ids
  if (bid) {
    $('input[name=form_build_id]').remove();
    $('#comment-form-content > #comment-form').append('<input type="hidden" id="' +bid+ '" value="' +bid+ '" name="form_build_id"/>');
  }
  // ...and captcha
  if (captcha) {
    $('#comment-form-content > #comment-form .captcha').html(captcha);
  }
  // ...and action
  if (action) {
    $('#comment-form-content > #comment-form').attr('action', action);
  }
  
  // reinitializing ajax-submit
  $('#comment-form-content > #comment-form').removeClass('ajaxsubmit-processed');
  // enabling form controls again
  $('#comment-form-content > #comment-form .form-submit').removeAttr('disabled');
}

// Reply link handler
function reply_click() {
  // We should only handle non presed links
  if (!$(this).is('.pressed')){
    // We should remove any WYSIWYG before moving controls
    ajax_comments_remove_editors();
    
    // move form from old position
    if ($(this).is('#comment-form-title')) {
      $('#comment-form-content').removeClass('indented');
      $('#comment-form-content').after('<div style="height:' + $('#comment-form-content').height() + 'px;" class="sizer"></div>');
      $('.sizer').slideUp('fast', function(){$(this).remove();});
      $(this).parent().after($('#comment-form-content'));
      rows = Drupal.settings.rows_default;
    }
    else {
      $('#comment-form-content').addClass('indented');
      $('#comment-form-content').after('<div style="height:' + $('#comment-form-content').height() + 'px;" class="sizer"></div>');
      $('.sizer').slideUp('fast', function(){$(this).remove();});
      $(this).parents(commentbox).after($('#comment-form-content'));
      rows = Drupal.settings.rows_in_reply;
    }
    $('#comment-form-content').hide();

    // Going further
    initForm($(this).attr('href'), rows);
    $('.pressed').removeClass('pressed');
    $(this).addClass('pressed');
  }
  else {
    // close form on doble reply clicks
    if (!$(this).is('#comment-form-title') || !Drupal.settings.always_expand_main_form) {
      ajax_comments_close_form();
    }
    // ...and expand main form, if it's always expanded
    if ((!$(this).is('#comment-form-title')) && (Drupal.settings.always_expand_main_form)) {
      $('#comment-form-title').trigger('click');
    }
  }

  if(typeof(fix_control_size)!='undefined'){ fix_control_size(); };
  return false;
}

// delete links handler
function delete_click() {
  if ((ctrl) || (confirm(Drupal.t('Are you sure you want to delete the comment? Any replies to this comment will be lost. This action cannot be undone.')))) {
    // taking link's href as AJAX url
    action = $(this).attr('href');
    comment = $(this).parents(commentbox);
    // specially for Opera browser
    a1 = action.replace('http:// ','');
    // getting token params (/comment/delete/x)
    var arr = a1.split('/');
    cid = arr[3];
    if (cid) {
      $.ajax({
        type: "GET",
        url: Drupal.settings.basePath + "comment/instant_delete/" + cid,
        success: function(form){
          // if comment form is expanded on this module, we should collapse it first
          if (comment.next().is('#comment-form-content')) {
            thread = comment.next().next('.indented');
            $('#comment-form-content').animate({height:'hide', opacity:'hide'});
          } else {
            thread = comment.next('.indented');
          }
          thread.animate({height:'hide', opacity:'hide'});
          comment.animate({height:'hide', opacity:'hide'}, 'fast', function(){
            thread.remove();
            comment.remove();
            if (!$(commentbox).length) {
              $('#comment-controls').animate({height:'hide', opacity:'hide'}, 'fast', function(){ $(this).remove(); });
            }
          });
        }
      });
    }
  }
  return false;
}



/*
$('#comments .pager a').bind('click', function(){
  href = $(this).attr('href');
  page = href.split('?');
  alert(123);
})*/




// ====================================
// Misc. functions
// ====================================


function ajax_comments_expand_form() {
  $('#comment-form-content').animate({height:'show'}, 'fast', function() {  $('#comment-form textarea').focus(); });
}

function ajax_comments_close_form() {
  $('#comment-form-content').animate({height:'hide', opacity:'hide'});
  $('.pressed').removeClass('pressed');
}



// AHAH effect for comment previews
jQuery.fn.ajaxCommentsPreviewToggle = function(speed) {
  var obj = $(this[0]);
  initForm_setTokens($('#comment-form', obj));
  $('#comment-form', obj).remove();
  
  // hiding previous previews
  $('#comment-preview > div:visible').animate({height:'hide', opacity:'hide'}, 'fast', function() { $(this).remove(); } );
  // showing fresh preview
  obj.animate({height:'show', opacity:'show'}, 'fast');
};


// AHAH effect for comment submits
jQuery.fn.ajaxCommentsSubmitToggle = function(speed) {
  var obj = $(this[0]);
  
  initForm_setTokens($('#comment-form', obj));
  $('#comment-form', obj).remove();

  html = obj.html();
  if (html.indexOf('comment-new-success') != -1) {
    // empty any preview before output comment
    $('#comment-form-content #comment-preview').empty();
    
    // move comment out of comment form box if posting to main thread
    if ($('#comment-form-title').is('.pressed')){
      $('#comment-form-content').parents('.box').before(obj);
    }
    // at last - showing it up
    obj.animate({height:'show', opacity:'show'}, 'fast');

    // re-attaching to new comment
    Drupal.attachBehaviors(html);
    
    // hiding comment form
    ajax_comments_close_form();
    // ...and cleaning it up
    $('#comment-form textarea').attr('value','');
  } else {
    $('#comment-preview').append(obj);
    obj.ajaxCommentsPreviewToggle(speed);
  }
};

// remove editors from comments textarea (mostly to re-attach it)
function ajax_comments_remove_editors() {
  ajax_comments_update_editors();
  if (typeof(tinyMCE) != 'undefined') {
    if (tinyMCE.getInstanceById("edit-comment")) {
      tinyMCE.execCommand('mceRemoveControl', false, "edit-comment");
    }
  }
}

// attach editors to comments textarea if needed
function ajax_comments_attach_editors() {
  if (typeof(tinyMCE) != 'undefined') {
    // ugly hack to get invisible element's width
    height = $('#comment-form-content').css('height');
    overflow = $('#comment-form-content').css('overflow');
    $('#comment-form-content').css('height', '0px');
    $('#comment-form-content').css('overflow', 'hidden');
    $('#comment-form-content').show();
    
    tinyMCE.execCommand('mceAddControl', false, "edit-comment");
    
    // returning old values
    $('#comment-form-content').css('height', height);
    $('#comment-form-content').css('overflow', overflow);
    $('#comment-form-content').hide();
  }
}

// update editors text to their textareas. Need to be done befor submits
function ajax_comments_update_editors() {
  // update tinyMCE
  if (typeof(tinyMCE) != 'undefined') {
    tinyMCE.triggerSave();
  }
  
  // update FCKeditor
  if (typeof(doFCKeditorSave) != 'undefined') {
    doFCKeditorSave();
  }
  if(typeof(FCKeditor_OnAfterLinkedFieldUpdate) != 'undefined'){
    FCKeditor_OnAfterLinkedFieldUpdate(FCKeditorAPI.GetInstance('edit-comment'));
  }
}
