commentbox = ".comment";
ctrl = false;

$(document).ready(function() { 
  // prepare the form when the DOM is ready
  initAjaxComments();

  // add Ctrl key listener for deletion feature
  $(window).keydown(function(e) {
    if(e.keyCode == 17) {
      ctrl = true;
    }
  });
  $(window).keyup(function(e) {
    ctrl = false;
  });
  
});

function initAjaxComments(){
  if ($('#comment-form').length) {
    var options = { 
        beforeSubmit:  showRequest,  // pre-submit callback 
        success:       showResponse,  // post-submit callback 
        dataType:  'json',
        semantic: true
    }; 
    // bind form using 'ajaxForm' 
    $('#comment-form').ajaxForm(options);
    
    if ((Drupal.settings.rows_default == undefined) || (!Drupal.settings.rows_default)) {
      Drupal.settings.rows_default = $('#comment-form textarea').attr('rows');
    }
    $('#comment-form textarea').attr('rows', Drupal.settings.rows_default);
    if ((Drupal.settings.rows_in_reply == undefined) || (!Drupal.settings.rows_in_reply)) {
      Drupal.settings.rows_in_reply = Drupal.settings.rows_default;
    }
    if (Drupal.settings.always_expand_form == undefined) {
      Drupal.settings.always_expand_form = true;
    }

    //initializing comments links
    $('.comment_reply a').click(reply_click);
    $('.comment_delete a').click(delete_click);
    
    //initializing main form
    action = $('#comment-form').attr('action');
    
    title_element = $('#comment-form').parents(".box").find("h2,h3,h4");
    title = title_element.html();
    title_element.html('<a href="'+action+'" id="comment-form-title">'+title+'</a>');
    $('#comment-form').parents(".box").find(".content").attr('id','comment-form-content');
    
    page_url = document.location.toString();
    fragment = '';
    if (page_url.match('#'))
      fragment = page_url.split('#')[1];
    
    if ((fragment != 'comment-form') && (!Drupal.settings.always_expand_form)) {
      $('#comment-form-content').hide();
    }
    else {
      $('#comment-form-title').addClass('pressed');
    }
    
    $('#comment-form-title').click(reply_click);
    fix_control_size();
  }
}

function initForm(action, rows){
  //resizing textarea
  $('#comment-form textarea').attr('rows', rows);
  $('#comment-form textarea').attr('value','');
  
  //clearing form
  $('#comment-form-content #comment-preview').empty();
  $('#comment-form .error').removeClass('error');
  
  // if user is not anonimous, getting the proper form token
  if ($('#comment-form #edit-form-token').get(0) || $('.captcha').length) {
    //disabling buttons while loading tokens
    $('.form-submit').attr('disabled','true');

    //specially for Opera browser
    a1 = action.replace('http://','');
    //getting token params (/comment/reply/x/p)
    var arr = a1.split('/');
    if (!arr[4]) arr[4] = '0';
    //sending ajax call to get the token
    var token = 0;
    $.ajax({
      type: "GET",
      url: Drupal.settings.basePath + "get_form_token/" + arr[3] + '/' + arr[4],
      success: function(form){
        token = $("#edit-form-token", form).val();
        captcha = $(".captcha", form).html();
        initForm_Step2(token,captcha,action,rows);
      }
    });
  }
  else {
    initForm_Step2('','',action,rows)
  }
  
  //show after all was done
  $('#comment-form-content').animate({height:'show'});

}

function initForm_Step2(token,captcha,action,rows){
    if (token) {
      $('#comment-form #edit-form-token').attr('value',token);
    }
    if (captcha) {
      $('.captcha').html(captcha);
    }
    $('#comment-form textarea').focus();
    
    //setting a new action for form
    $('#comment-form').attr('action',action);
    //reinitializing ajax-submit
    $('#comment-form').removeClass('ajaxsubmit-processed');
    
    $('.form-submit').removeAttr('disabled');
}


function reply_click() {
  if ($(this).is('.pressed')){
  }
  else {
    if ($(this).is('#comment-form-title')) {
      $('#comment-form-content').after('<div style="height:' + $('#comment-form-content').height() + 'px;" class="sizer"></div>');
      $('.sizer').slideUp(500,function(){$(this).remove();});

      $(this).parent().after($('#comment-form-content'));

      rows = Drupal.settings.rows_default;
    }
    else {
      $('#comment-form-content').after('<div style="height:' + $('#comment-form-content').height() + 'px;" class="sizer"></div>');
      $('.sizer').slideUp(500,function(){$(this).remove();});

      $(this).parents(commentbox).after($('#comment-form-content'));
      rows = Drupal.settings.rows_in_reply;
    }

    $('#comment-form-content').hide();
    
    initForm($(this).attr('href'), rows);
    $('.pressed').removeClass('pressed');
    $(this).addClass('pressed');
  }
  fix_control_size();
  return false;
}

// delete links handler
function delete_click() {
  if ((ctrl) || (confirm(Drupal.t('Are you sure you want to delete the comment? Any replies to this comment will be lost. This action cannot be undone.')))) {
    action = $(this).attr('href');
    comment = $(this).parents(commentbox);
    //specially for Opera browser
    a1 = action.replace('http://','');
    //getting token params (/comment/delete/x)
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
          comment.animate({height:'hide', opacity:'hide'}, 'fast', function(){ thread.remove(); comment.remove(); });
        }
      });
    }
  }
  return false;
}


// pre-submit callback 
function showRequest(formData, jqForm, options) { 
  $('#comment-preview').fadeTo('fast', 0.1, function(){
    $('#comment-preview').html('<div class="progress"><div class="bar"></div></div>');
    $('#comment-preview').fadeTo('fast',1);
  });
  $('.form-submit').attr('disabled','true');

  // here we could return false to prevent the form from being submitted; 
  // returning anything other than false will allow the form submit to continue 
  return true; 
} 

 
// post-submit callback 
function showResponse(responseText, statusText)  {
  if (responseText.data.message)
    text = responseText.data.message;
  else
    text = responseText.data.preview;
  
  if ((responseText.data.captcha)||(responseText.data.token)){
    $('.captcha').html($(responseText.data.captcha).html());
  }
  
  if (responseText.data.destination != ''){
    if ($('#comment-form-title').is('.pressed')){
      $('#comment-form-content').parents('.box').before(text);
    }
    else{
      $('#comment-form-content').before(text);
    }

    //initializing new "Reply" link
    $('a.comment_reply').click(reply_click);

    $('#comment-form-content').animate({height:'hide', opacity:'hide'});
    
    $('.pressed').removeClass('pressed');
  }
  else {
    $('#comment-preview').fadeTo('fast',0.1,function(){
      $('#comment-preview').html(text);
      $('#comment-preview').fadeTo('fast',1);
      if (!$('#comment-form #edit-submit').length && !$('#comment-form #edit-submit-1').length) {
        $('#comment-form #edit-preview').after(responseText.data.submit);
        $('#comment-form #edit-submit').fadeIn('fast');
      }
    });
  }
  $('.form-submit').removeAttr('disabled');
}


function fix_control_size() {
/*  $("textarea").each(function(){
    $(this).width($(this).parents('div').width() - 12);
  });
  $(".grippie").each(function(){
    $(this).width($(this).parents('div').width() - 2);
  });*/
}
