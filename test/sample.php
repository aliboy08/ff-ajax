<?php
$query_args = [
    'post_type' => 'post',
    'showposts' => 2,
    'no_found_rows' => true,
];

$settings = [
    'id' => 'ajax_sample_1',
    'item_template' => __DIR__ . '/item-sample.php',
    'query_args' => $query_args,
    'initial_query' => true,
    'filters_container' => '.ajax_filters',
    'indicators_container' => '.filter_indicators',
    'total_posts_count' => '.total_posts_count .count',
    // 'query_strings' => true,
];

$ff_ajax = new \FF_Ajax($settings);

echo '<div class="ajax_filters">';

    // $ff_ajax->filter_buttons([
    //     'taxonomy' => 'category',
    //     'multiple' => true,
    // ]);

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
    
    $ff_ajax->filter_dropdown([
        'taxonomy' => 'category',
        'placeholder' => 'Category',
        'exclude' => ['uncategorized'],
        'multiple' => true,
    ]);

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

    // $ff_ajax->filter_checkboxes([
    //     'taxonomy' => 'category',
    //     'multiple' => true,
    // ]);

    ?>
    <!-- <div class="filter-con filter_price" data-query_type="meta_query" data-meta_key="price">
        <button data-value="0,100">0-100</button>
        <button data-value="100,200">100-200</button>
        <button data-value="200,300">200-300</button>
        <button data-value="300,400">300-400</button>
    </div> -->
    <?php
    
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

echo '<div class="total_posts_count">Posts count: <span class="count">...</span></div>';

echo '<div class="ff_ajax" '. $ff_ajax->settings_attr() .'>';
    $ff_ajax->render();
echo '</div>';

?>
<script>
window.addEventListener('load',()=>{
    let field = document.querySelector('.filter_price');
    if( !field ) return;
 
    let ff_ajax = document.querySelector('.ff_ajax').ff_ajax;
    console.log('ajax', ff_ajax)

    field.querySelectorAll('button').forEach(button=>{
        let value = button.dataset.value.split(',');
        let min = parseInt(value[0]);
        let max = parseInt(value[1]);
        button.addEventListener('click', ()=>{

            // price from
            ff_ajax.filters.update_filter('price_from', 'meta_query', {
                key: 'price',
                value: min,
                type: 'NUMERIC',
                compare: '>=',
            });

            // price to
            ff_ajax.filters.update_filter('price_to', 'meta_query', {
                key: 'price',
                value: max,
                type: 'NUMERIC',
                compare: '<=',
            });

            ff_ajax.filters.query();
        })
    })
})
</script>