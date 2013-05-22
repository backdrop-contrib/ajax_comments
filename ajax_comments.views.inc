<?php
/*
 ** @file
 *  views declarations
 */

/**
 * Implements hook_views_data().
 */
function ajax_comments_views_data() {
  // node_comment_statistics table.
  // comment_count.
  $data['node']['ajax_comment'] = array(
    'title' => t('AJAX Add Comment'),
    'help' => t('Adds an inline AJAX comment form.'),
    'field' => array(
      'handler' => 'views_handler_field_ajax_add_comment',
    ),
  );

  return $data;
}