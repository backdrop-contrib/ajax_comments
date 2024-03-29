<?php
/**
 * @file
 * Definition of ajax_comments_handler_field_list_comments.
 * TODO: Comments per page as setting
 * TODO: Flat or nested as option
 */

/**
 * Handler for showing an ajaxified list of comments.
 */
class ajax_comments_handler_field_list_comments extends views_handler_field_entity {

  public function option_definition() {
    $options = parent::option_definition();
    $options['ajax_comments_display_add_comment_form'] = array(
      'default' => FALSE,
      'bool' => TRUE,
    );
    return $options;
  }

  public function options_form(&$form, &$form_state) {
    $form['ajax_comments_display_add_comment_form'] = array(
      '#title' => t('Show Add Comment form'),
      '#description' => t("Enable to display the Add Comment form below the list of comments."),
      '#type' => 'checkbox',
      '#default_value' => $this->options['ajax_comments_display_add_comment_form'],
    );
    parent::options_form($form, $form_state);
  }

  public function pre_render(&$values) {
    parent::pre_render($values);

    // Load necessary AJAX libraries.
    backdrop_add_js(backdrop_get_path('module', 'ajax_comments') . '/js/ajax_comments.js');
    backdrop_add_library('system', 'backdrop.ajax');
    if (module_exists('ajax_comments_nodejs')) {
      foreach ($values as $node) {
        nodejs_send_content_channel_token('ajax_comments_nodejs_' . $node->nid);
      }
      backdrop_add_js(backdrop_get_path('module', 'ajax_comments_nodejs') . '/js/nodejs.ajaxcomments.js', array('type' => 'file'));
      backdrop_add_css(backdrop_get_path('module', 'ajax_comments_nodejs') . '/css/ajax_comments_nodejs.css', array('type' => 'file'));
    }
  }

  /**
   * Render the list of comments
   * modified to add the ajax_comments wrapper and the add comment form option.
   */
  public function render($values) {
    if ($node = $this->get_value($values)) {
      // Init with dummy Comment. For explanation look at ajax_comments_process_node().
      $result = array(
        'comments' => array(
          'dummyComment' => array(
            '#prefix' => '<div class="ajax-comment-wrapper ajax-comment-dummy-comment" style="display:none">',
            '#type' => 'item',
            '#markup' => '',
            '#suffix' => '</div>',
          ),
        ),
      );

      // Only attempt to render comments if the node has visible comments.
      // Unpublished comments are not included in $node->comment_count, so show
      // comments unconditionally if the user is an administrator.
      if (($node->comment_count && user_access('access comments')) ||
        user_access('administer comments')) {
        // TODO This variable was probably removed in Backdrop without replacement.
        $mode = variable_get('comment_default_mode_' . $node->type, COMMENT_MODE_THREADED);
        // TODO This variable was probably removed in Backdrop without replacement.
        $comments_per_page = variable_get('comment_default_per_page_' . $node->type, 150);
        if ($cids = comment_get_thread($node, $mode, $comments_per_page)) {
          $comments = comment_load_multiple($cids);
          comment_prepare_thread($comments);
          $build = comment_view_multiple($comments, $node);
          // TODO: There seems to be a problem with nested pagers :/
          //$build['pager']['#theme'] = 'pager';

          $result['comments'] += $build;
        }
      }

      // Append comment form if needed.
      // TODO This variable was probably removed in Backdrop without replacement.
      if (user_access('post comments') && $node->comment == COMMENT_NODE_OPEN
           && (variable_get('comment_form_location_' . $node->type, COMMENT_FORM_BELOW) == COMMENT_FORM_BELOW
          && $this->options['ajax_comments_display_add_comment_form'])) {
        $result['comment_form'] = backdrop_get_form("comment_node_{$node->type}_form", (object) array('nid' => $node->nid));
      }

      // Theme comments
      $result += array(
        '#theme' => 'comment_wrapper__node_' . $node->type,
        '#node' => $node,
        'comments' => array(),
        'comment_form' => array(),
      );
      return $result;
    }
  }

}
