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

  $form['ajax_comments_reply_autoclose'] = array(
    '#title' => t('Autoclose reply'),
    '#type' => 'checkbox',
    '#description' => t('Automatically close any opened reply forms.'),
    '#default_value' => $config->get('ajax_comments_reply_autoclose'),
  );
  $form['ajax_comments_disable_scroll'] = array(
    '#title' => t('Disable scrolling'),
    '#type' => 'checkbox',
    '#description' => t('Disable the scroll events.'),
    '#default_value' => $config->get('ajax_comments_disable_scroll'),
  );
  // Offset settings.
  $offset_selector = $config->get('offset_selector');
  $custom_offset = $config->get('custom_offset');
  $form['offsets'] = array(
    '#type' => 'details',
    '#summary' => t('Scrolling offsets'),
    '#description' => t("Set custom offsets to prevent a sticky element from overlapping with the reply form."),
    '#open' => (!empty($offset_selector) || !empty($custom_offset)),
    '#weight' => 21,
    '#states' => array(
      'visible' => array(
        ':input[name="ajax_comments_disable_scroll"]' => array('checked' => FALSE),
      ),
    ),
  );
  $form['offsets']['offset_selector'] = array(
    '#type' => 'textfield',
    '#title' => t('Selector'),
    '#description' => t('Element to use as an offset. Use jQuery format (e.g. <strong>#admin-bar</strong>).'),
    '#default_value' => $offset_selector,
  );
  $form['offsets']['custom_offset'] = array(
    '#type' => 'number',
    '#title' => t('Custom offset'),
    '#description' => t('Additional custom offset (in pixels).'),
    '#default_value' => $custom_offset,
    '#min' => 0,
    '#step' => 1,
  );

  return system_settings_form($form);
}
