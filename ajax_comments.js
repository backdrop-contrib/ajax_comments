(function ($) {

    // Scroll to given element
    Drupal.ajax.prototype.commands.ajaxCommentsScrollToElement = function(ajax, response, status) {
        try {
            pos = $(response.selector).offset();
            $('html, body').animate({ scrollTop: pos.top}, 'slow');
        } catch (e) {
            console.log('ajaxComments-ScrollToElementError: ' + e.name);
        }
    };

    /**
     * Add the dummy div if they are not exist.
     * On the server side we have a current state of node and comments, but on client side we may have a outdated state
     * and some div's may be not present
     */
    Drupal.ajax.prototype.commands.ajaxCommentsAddDummyDivAfter = function(ajax, response, status) {
        try {
            if (!$(response.selector).next().hasClass(response.class)) {
                $('<div class="' + response.class + '"></div>').insertAfter(response.selector);
            }
        } catch (e) {
            console.log('ajaxComments-AddDummyDivAfter: ' + e.name);
        }
    };

    /*
     * These function may be removed when bug #736066 is fixed
     * At this time, ajax.js automatically wrap comment content into div when we use ajax_command_NAME functions,
     * and this is not good for us because this broke div layout
     */

    /**
     * Own implementation of ajax_command_replace()
     * see bug: https://www.drupal.org/node/736066
     */
    Drupal.ajax.prototype.commands.ajaxCommentsReplace = function(ajax, response, status) {
        try {
            // Removing content from the wrapper, detach behaviors first.
            var wrapper = response.selector ? $(response.selector) : $(ajax.wrapper);
            var settings = response.settings || ajax.settings || Drupal.settings;
            Drupal.detachBehaviors(wrapper, settings);

            $(response.selector).replaceWith(response.html);

            // Attach all JavaScript behaviors to the new content, if it was successfully
            // added to the page, this if statement allows #ajax['wrapper'] to be
            // optional.
            var settings = response.settings || ajax.settings || Drupal.settings;
            Drupal.attachBehaviors(response.data, settings);
        } catch (e) {
            console.log('ajaxComments-Replace: ' + e.name)
        }
    };

    /**
     * Own implementation of ajax_command_before()
     * see bug: https://www.drupal.org/node/736066
     */
    Drupal.ajax.prototype.commands.ajaxCommentsBefore = function(ajax, response, status) {
        try {
            $(response.html).insertBefore(response.selector);

            // Attach all JavaScript behaviors to the new content, if it was successfully
            // added to the page, this if statement allows #ajax['wrapper'] to be
            // optional.
            var settings = response.settings || ajax.settings || Drupal.settings;
            Drupal.attachBehaviors(response.data, settings);
        } catch (e) {
            console.log('ajaxComments-Before: ' + e.name)
        }
    };

    /**
     * Own implementation of ajax_command_after()
     * see bug: https://www.drupal.org/node/736066
     */
    Drupal.ajax.prototype.commands.ajaxCommentsAfter = function(ajax, response, status) {
        try {
            $(response.html).insertAfter(response.selector);

            // Attach all JavaScript behaviors to the new content, if it was successfully
            // added to the page, this if statement allows #ajax['wrapper'] to be
            // optional.
            var settings = response.settings || ajax.settings || Drupal.settings;
            Drupal.attachBehaviors(response.data, settings);
        } catch (e) {
            console.log('ajaxComments-After: ' + e.name)
        }
    };

    /**
     * Own implementation of ajax_command_insert()
     * see bug: https://www.drupal.org/node/736066
     */
    Drupal.ajax.prototype.commands.ajaxCommentsPrepend = function(ajax, response, status) {
        try {
            $(response.selector).prepend(response.html);

            // Attach all JavaScript behaviors to the new content, if it was successfully
            // added to the page, this if statement allows #ajax['wrapper'] to be
            // optional.
            var settings = response.settings || ajax.settings || Drupal.settings;
            Drupal.attachBehaviors(response.data, settings);
        } catch (e) {
            console.log('ajaxComments-Prepend: ' + e.name)
        }
    };

    /**
     * Own implementation of ajax_command_append()
     * see bug: https://www.drupal.org/node/736066
     */
    Drupal.ajax.prototype.commands.ajaxCommentsAppend = function(ajax, response, status) {
        try {
            $(response.selector).append(response.html);

            // Attach all JavaScript behaviors to the new content, if it was successfully
            // added to the page, this if statement allows #ajax['wrapper'] to be
            // optional.
            var settings = response.settings || ajax.settings || Drupal.settings;
            Drupal.attachBehaviors(response.data, settings);
        } catch (e) {
            console.log('ajaxComments-Append: ' + e.name)
        }
    };

}(jQuery));
