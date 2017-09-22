var SortableConfigRef = 
{
    "config":    
    {
        "key_section_ref_sort": "sort_items",
        "id_content_display_items": "listItems",
        "default_sort_section_not_defined" : "last_modified",
        "class_ref_item" : "list-group-item",
        "id_index_ref_item": "id-sortable",
        "id_select_ref": "sortListItems",
        "id_form_ref": "sortableItems",
        "class_invisible": "u-hidden"                     
    },
    "config_with_tableflex":    
    {
        "nb_max_field_after_title": 3,
        "field_col_sm_value_boostrap": 2,
        "field_col_xs_value_boostrap": 1,
        "first_field_col_xs_value_boostrap": 3,
        "actions_col_sm_value_boostrap": 2,
        "max_col_sm_value_boostrap": 12, //not modify ! depend bootstrap3.3.6+
        "max_col_xs_value_boostrap": 12,
        "actions_title_on_table_flex": "Actions",
        "last_modified_undef_date_ref": "date-publication", //defined in list_sort_type with "show_on_table_flex" : true
        "class_field_sort_selected": "selected-sort"
    },
    "list_sort_type" : 
    [
        //default must be first of the list !
        // default and last_modified must not be remove !
        {
            "id" : "default",
            "type": "default",
            "table_flex_type": 'default',
            "asc_order": true,
            "show_on_select": true,
            "trad_editor":"0..9a..z",
            "display_depend_section_ref" : false,
            // "show_on_table_flex": true, //note : title always show, no test on loop
            "title_on_table_flex": "Title",
            "title_on_table_flex_section": "Sections", //specific  id default
            "title_on_table_flex_file": "Items"
                         
        },
        {
            "id" : "last_modified",
            "field_ref_update": "update", //only one on the list !      
            "type": "date",
            "table_flex_type": 'moment_from_now',
            "asc_order": false,                
            "show_on_select": true,
            "trad_editor":"Last modified",
            "display_depend_section_ref" : false,
            "show_on_table_flex": true,
            "title_on_table_flex": "Last&nbsp;modified"
                                           
        },
        {
            "id" : "order",
            "type": "integer",
            "table_flex_type": 'default',
            "asc_order": true,
            "show_on_select": true,               
            "trad_editor":"Order",
            "display_depend_section_ref" : true,
            "show_on_table_flex": true,
            "title_on_table_flex": "Order"                              
        },
        {
            "id" : "date-publication",
            "type": "date",
            "table_flex_type": 'moment_date',
            "asc_order": false,
            "show_on_select": true,
            "trad_editor":"Date publication",
            "display_depend_section_ref" : true,
            "show_on_table_flex": true,
            "title_on_table_flex": "Date&nbsp;publi"                            
        }
    ]   
   
};