(function ($) {
  /**
   * Backdrop.Nodejs.callback on node update.
   */
  Backdrop.Nodejs.callbacks.ajaxCommentsNodejs = {
    callback: function (message) {
      if (message.authToken != Backdrop.settings.nodejs.authToken) {
        if (typeof message.action === 'undefined') {
          Backdrop.nodejs_ajax.runCommands(message);
        }
        else {
          if (message.action == 'updated' && $('.comment-wrapper-' + message.cid).length == 0) {
            message.action = 'added';
          }
          var commentUrl = Backdrop.settings.basePath + 'ajax_comments_nodejs/view/' + message.action + '/' + message.cid;
          var ajaxSettings = {url : commentUrl};
          var ajaxRequest = new Backdrop.ajax(false, false, ajaxSettings);
          ajaxRequest.eventResponse(ajaxRequest, {});
        }
      }
    }
  };

  // Backdrop.ajaxCommentsNodejs
  Backdrop.behaviors.ajaxCommentsNodejs = {
    attach: function(context, settings) {
    $('.ajax-comments-nodejs-new', context).once('ajax-comments-nodejs-new-behavior', function() {
        if ($.isFunction($.fn.live)) {
        $('.ajax-comments-nodejs-new', context).live('mouseenter', function() {
            $(this).removeClass('ajax-comments-nodejs-new');
            $(this).unbind('mouseenter')
          });
        }
        else {
        $('.ajax-comments-nodejs-new', context).on('mouseenter', function() {
            $(this).removeClass('ajax-comments-nodejs-new');
            $(this).unbind('mouseenter')
          });
        };
      });
    $('.ajax-comments-nodejs-updated', context).once('ajax-comments-nodejs-updated-behavior', function() {
        if ($.isFunction($.fn.live)) {
        $('.ajax-comments-nodejs-updated', context).live('mouseenter', function() {
            $(this).removeClass('ajax-comments-nodejs-updated');
            $(this).unbind('mouseenter')
          });
        }
        else {
        $('.ajax-comments-nodejs-updated', context).on('mouseenter', function() {
            $(this).removeClass('ajax-comments-nodejs-updated');
            $(this).unbind('mouseenter')
          });
        };
      });
    }
  };

}(jQuery));
