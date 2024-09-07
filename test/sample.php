<?php
$query_args = [
    'post_type' => 'post',
    'showposts' => 2,
    'no_found_rows' => true,
];

$settings = [
    'item_template' => __DIR__ . '/item-sample.php',
    'query_args' => $query_args,
    'initial_query' => true,
    'filters' => '.ajax_filters',
    'indicators' => '.filter_indicators',
    'query_strings' => true,
];

$ff_ajax = new \FF_Ajax($settings);

echo '<div class="ajax_filters">';

    // $ff_ajax->filter_buttons([
    //     'taxonomy' => 'category',
    //     // 'multiple' => true,
    // ]);

    // $field = get_field_object('field_66dc24e4edf72');
    // $ff_ajax->filter_buttons([
    //     'meta_key' => 'color',
    //     // 'multiple' => true,
    //     'choices' => $field['choices'],
    // ]);
    
    // $ff_ajax->filter_dropdown([
    //     'taxonomy' => 'category',
    //     'placeholder' => 'Category',
    //     'exclude' => ['uncategorized'],
    //     'multiple' => true,
    // ]);

    // $choices = [
    //     'format_1' => 'Format 1',
    //     'format_2' => 'Format 2',
    //     'format_3' => 'Format 3',
    // ];
    // $ff_ajax->filter_dropdown([
    //     'meta_key' => 'format',
    //     'placeholder' => 'Format',
    //     'choices' => $choices,
    // ]);

    // $ff_ajax->filter_checkbox([
    //     'meta_key' => 'featured',
    //     'label' => 'Meta - checkbox - Featured',
    // ]);

    $ff_ajax->filter_checkboxes([
        'taxonomy' => 'category',
        'multiple' => true,
    ]);

    $ff_ajax->search_field([
        'placeholder' => 'Search...',
        'with_clear' => true,
    ]);

    $ff_ajax->sort_dropdown([
        'placeholder' => 'Sort',
        'choices' => [
            [
                'label' => 'Latest',
                'orderby' => 'date',
                'order' => 'DESC',
            ],
            [
                'label' => 'Oldest',
                'orderby' => 'date',
                'order' => 'ASC',
            ],
            [
                'label' => 'Title A-Z',
                'orderby' => 'title',
                'order' => 'ASC',
            ],
            [
                'label' => 'Title Z-A',
                'orderby' => 'title',
                'order' => 'DESC',
            ],
            [
                'label' => 'META - Date ASC',
                'meta_key' => 'date',
                'orderby' => 'meta_value_num',
                'order' => 'ASC',
            ],
            [
                'label' => 'META - Date DESC',
                'meta_key' => 'date',
                'orderby' => 'meta_value_num',
                'order' => 'DESC',
            ],
            [
                'label' => 'META - Price ASC',
                'meta_key' => 'price',
                'orderby' => 'meta_value_num',
                'order' => 'ASC',
            ],
            [
                'label' => 'META - Price DESC',
                'meta_key' => 'price',
                'orderby' => 'meta_value_num',
                'order' => 'DESC',
            ],
        ],
    ]);

echo '</div>';

echo '<div class="filter_indicators"></div>';

$ff_ajax->initial_query();

echo '<div class="ff_ajax" '. $ff_ajax->settings_attr() .'>';
    $ff_ajax->render();
echo '</div>';