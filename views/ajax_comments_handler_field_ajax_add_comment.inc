<?php
/*
 ** @file
 *  views handler class
 *  mostyly just  renders the field for views display  and adds  js and css
 */
class ajax_comments_handler_field_ajax_add_comment extends views_handler_field_comment_node_link {
  var $output;

  function option_definition() {
    $options = parent::option_definition();
    $options['text'] = array('default' => '', 'translatable' => TRUE);
    return $options;
  }

  function options_form(&$form, &$form_state) {
    $form['text'] = array(
      '#type' => 'textfield',
      '#title' => t('Text to display'),
      '#default_value' => $this->options['text'],
    );
    parent::options_form($form, $form_state);
    
    // The path is set by render_link function so don't allow to set it.
    $form['alter']['path'] = array('#access' => FALSE);
    $form['alter']['external'] = array('#access' => FALSE);
  }

  function pre_render(&$values) {
    parent::pre_render($values);

    // Load necessary AJAX libraries.
    drupal_add_js(drupal_get_path('module', 'ajax_comments') . '/ajax_comments.js');
    drupal_add_library('system', 'drupal.ajax');
  }

  function render($values) {
    if (user_access('post comments') && $node = $this->get_value($values)) {
      // Add Comment wrapper
      $result = '<div class="comment-wrapper comment-wrapper-nid-' . $node->nid .'">';
      // Add dummy comment
      $result .= '<div class="ajax-comment-wrapper ajax-comment-dummy-comment"></div>';
      // Generate a unique token to prevent illegitimate requests.
      $options = array(
        'attributes' => array(
          'class' => array(
            'use-ajax',
            'ajax-comments-reply-' . $node->nid . '-0',
          ),
        ),
        'query' => array('ajax-comments-views-inline-form' => drupal_get_token('reply-' . $node->nid)),
        );
      $path = 'ajax_comments/reply/' . $node->nid;
      $text = !empty($this->options['text']) ? $this->options['text'] : t('Add new comment');
      // Close Comment wrapper
      $result .= l($text, $path, $options) . '</div>';
      return $result;
    }
  }
}
