(function ($) {

 // Scroll to given element
  Backdrop.ajax.prototype.commands.ajaxCommentsScrollToElement = function(ajax, response, status) {
    var delayInMilliseconds = 250; // Give time for the Ajax reply form to load.

    setTimeout(function () {
      try {
        var offset = 0;
        offset += parseInt(Backdrop.settings.ajaxcomments.offsets.custom_offset);
        offset = offset || 0;
        $(Backdrop.settings.ajaxcomments.offsets.selector).each(function () {
          offset += $(this).outerHeight();
        });
        pos = $(response.selector).offset();
        console.log(pos);
        console.log(offset);
        $('html, body').animate({ scrollTop: pos.top - offset }, 'slow');
      }
      catch (e) {
        console.log('ajaxComments-ScrollToElementError: ' + e.name);
      }
    }, delayInMilliseconds);
  };

  /**
   * Add the dummy div if they are not exist.
   * On the server side we have a current state of node and comments, but on client side we may have a outdated state
   * and some div's may be not present
   */
  Backdrop.ajax.prototype.commands.ajaxCommentsAddDummyDivAfter = function(ajax, response, status) {
    try {
      if (!$(response.selector).next().hasClass(response.class)) {
        $('<div class="' + response.class + '"></div>').insertAfter(response.selector);
      }
    }
    catch (e) {
      console.log('ajaxComments-AddDummyDivAfter: ' + e.name);
    }
  };

  /*
   * These function may be removed when bug #736066 is fixed
   * At this time, ajax.js automatically wrap comment content into div when we use ajax_command_NAME functions,
   * and this is not good for us because this broke html layout
   */

  /**
   * Own implementation of ajax_command_replace()
   * see bug: https://www.drupal.org/node/736066
   */
  Backdrop.ajax.prototype.commands.ajaxCommentsReplace = function(ajax, response, status) {
    try {
      // Removing content from the wrapper, detach behaviors first.
      var wrapper = response.selector ? $(response.selector) : $(ajax.wrapper);
      var settings = response.settings || ajax.settings || Backdrop.settings;
      Backdrop.detachBehaviors(wrapper, settings);

      $(response.selector).replaceWith(response.html);

      // Attach all JavaScript behaviors to the new content, if it was successfully
      // added to the page, this if statement allows #ajax['wrapper'] to be
      // optional.
      var settings = response.settings || ajax.settings || Backdrop.settings;
      Backdrop.attachBehaviors(response.data, settings);
    }
    catch (e) {
      console.log('ajaxComments-Replace: ' + e.name)
    }
  };

  /**
   * Own implementation of ajax_command_before()
   * see bug: https://www.drupal.org/node/736066
   */
  Backdrop.ajax.prototype.commands.ajaxCommentsBefore = function(ajax, response, status) {
    try {
      $(response.html).insertBefore(response.selector);

      // Attach all JavaScript behaviors to the new content, if it was successfully
      // added to the page, this if statement allows #ajax['wrapper'] to be
      // optional.
      var settings = response.settings || ajax.settings || Backdrop.settings;
        Backdrop.attachBehaviors(response.data, settings);
      }
      catch (e) {
        console.log('ajaxComments-Before: ' + e.name)
      }
  };

  /**
   * Own implementation of ajax_command_after()
   * see bug: https://www.drupal.org/node/736066
   */
  Backdrop.ajax.prototype.commands.ajaxCommentsAfter = function(ajax, response, status) {
    try {
      var $element = $(response.selector);
      var $nextElement = $($element).next();

      if ($nextElement.hasClass('indented')) {
        $element = $nextElement;
      }
      $(response.html).insertAfter($element);

      // Attach all JavaScript behaviors to the new content, if it was successfully
      // added to the page, this if statement allows #ajax['wrapper'] to be
      // optional.
      var settings = response.settings || ajax.settings || Backdrop.settings;
      Backdrop.attachBehaviors(response.data, settings);
    }
    catch (e) {
      console.log('ajaxComments-After: ' + e.name)
    }
  };

  /**
   * Own implementation of ajax_command_insert()
   * see bug: https://www.drupal.org/node/736066
   */
  Backdrop.ajax.prototype.commands.ajaxCommentsPrepend = function(ajax, response, status) {
    try {
      $(response.selector).prepend(response.html);

      // Attach all JavaScript behaviors to the new content, if it was successfully
      // added to the page, this if statement allows #ajax['wrapper'] to be
      // optional.
      var settings = response.settings || ajax.settings || Backdrop.settings;
      Backdrop.attachBehaviors(response.data, settings);
    }
    catch (e) {
      console.log('ajaxComments-Prepend: ' + e.name)
    }
  };

  /**
   * Own implementation of ajax_command_append()
   * see bug: https://www.drupal.org/node/736066
   */
  Backdrop.ajax.prototype.commands.ajaxCommentsAppend = function(ajax, response, status) {
    try {
      $(response.selector).append(response.html);

      // Attach all JavaScript behaviors to the new content, if it was successfully
      // added to the page, this if statement allows #ajax['wrapper'] to be
      // optional.
      var settings = response.settings || ajax.settings || Backdrop.settings;
      Backdrop.attachBehaviors(response.data, settings);
    }
    catch (e) {
      console.log('ajaxComments-Append: ' + e.name)
    }
  };

  /**
   * Own Bind Ajax behavior for comment links.
   */
  Backdrop.behaviors.ajaxCommentsBehavior = {
    attach: function(context, settings) {
      // Bind Ajax behavior to all items showing the class.
    $('.use-ajax-comments:not(.ajax-processed)').addClass('ajax-processed').each(function () {
        var element_settings = {};
        // Clicked links look better with the throbber than the progress bar.
        element_settings.progress = { 'type': 'throbber' };

        // For anchor tags, these will go to the target of the anchor rather
        // than the usual location.
        if ($(this).attr('href')) {
          element_settings.url = $(this).attr('href').replace('comment', 'ajax_comment');
          element_settings.event = 'click';
        }
        var base = $(this).attr('id');
        Backdrop.ajax[base] = new Backdrop.ajax(base, this, element_settings);
      });
    }
  };

}(jQuery));
