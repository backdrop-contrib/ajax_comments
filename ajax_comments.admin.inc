<?php

/**
 * @file
 * AJAX comments settings form.
 */

function ajax_comments_settings() {
  $config = config('ajax_comments.settings');
  $form['#config'] = 'ajax_comments.settings';
  $form['ajax_comments_node_types'] = array(
    '#title' => t('Content types'),
    '#type' => 'checkboxes',
    '#description' => t('Select content types you want to activate Ajax Comments on. If you select nothing, it will be enabled everywhere.'),
    '#default_value' => $config->get('ajax_comments_node_types'),
    '#options' => node_type_get_names(),
  );
  $form['ajax_comments_notify'] = array(
    '#title' => t('Notification Message'),
    '#type' => 'checkbox',
    '#description' => t('Add notification message to comment when posted.'),
    '#default_value' => $config->get('ajax_comments_notify'),
  );

  $form['ajax_comments_disable_scroll'] = array(
    '#title' => t('Disable scrolling'),
    '#type' => 'checkbox',
    '#description' => t('Disable the scroll events.'),
    '#default_value' => $config->get('ajax_comments_disable_scroll'),
  );

  $form['ajax_comments_reply_autoclose'] = array(
    '#title' => t('Autoclose reply'),
    '#type' => 'checkbox',
    '#description' => t('Automatically close any opened reply forms.'),
    '#default_value' => $config->get('ajax_comments_reply_autoclose'),
  );

  return system_settings_form($form);
}
