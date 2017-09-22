var currentItemsTableFlex={};
var currentItemsTableFlex_index=0;


function tableFlexOnOpenSection(element_html, filter_sortable_fields,_lang)
{
	$(element_html).empty();
	if (filter_sortable_fields && currentItemsTableFlex_index === 0){
		return;
	}

	//------------------------------
	// init dimension table flex
	//------------------------------
	var max_field = 0;
	var max_field_ref = SortableConfigRef.config_with_tableflex.nb_max_field_after_title;
	SortableConfigRef.list_sort_type.forEach(function(sort_info, index_sort) 
	{
		if ((index_sort > 0) && (max_field < max_field_ref) && !(sort_info.show_on_table_flex === false))
		{				
			max_field++;				
		}
	});
	var max_col_sm = SortableConfigRef.config_with_tableflex.max_col_sm_value_boostrap;
	var max_col_xs = SortableConfigRef.config_with_tableflex.max_col_xs_value_boostrap;

	var col_sm_field = SortableConfigRef.config_with_tableflex.field_col_sm_value_boostrap;
	var col_xs_field = SortableConfigRef.config_with_tableflex.field_col_xs_value_boostrap;
	var col_xs_first_field = SortableConfigRef.config_with_tableflex.first_field_col_xs_value_boostrap;
	
	var col_sm_title = max_col_sm;
	var col_xs_title = max_col_xs;
	if (!(filter_sortable_fields === true)) 
	{
		col_sm_title -= max_field*col_sm_field;
		// col_xs_title -= max_field*col_xs_field;
		col_xs_title -= col_xs_first_field;
	}

	var col_sm_actions = SortableConfigRef.config_with_tableflex.actions_col_sm_value_boostrap;
	var col_sm_title_fields = max_col_sm - col_sm_actions;

	//----------------------
	// table flex, heading
	//----------------------
	var class_selected_sort=SortableConfigRef.config_with_tableflex.class_field_sort_selected;
	max_field = 0;
	var contentTableFlex_heading_start='';
	var contentTableFlex_heading_end='';
	var tableFieldId = [];
	var addListDir = false;

	var icon_fa = 'fa fa-sort-asc fa-1g';


	
	SortableConfigRef.list_sort_type.forEach(function(sort_info, index_sort) 
	{
		if (index_sort==0)
		{
			// adapt field title
			var field_title= sort_info.title_on_table_flex;
			if (sort_info.title_on_table_flex_section !== undefined && sort_info.title_on_table_flex_file !== undefined)
			{
				var addSection=false;
				var addItem=false;
				for (var iter_items = 0; iter_items < currentItemsTableFlex_index; iter_items++)
				{		
					var type_item = currentItemsTableFlex["type_item"][iter_items];
					// if (type_item === 'dir' || type_item === 'admin_dir' || type_item === 'tree' || type_item === 'empty_dir')
					if (type_item.indexOf('dir')>-1 ||  type_item === 'tree')
					{	addSection=true;}
					// if (type_item === 'file' || type_item === 'admin_file' || type_item === 'empty_file')
					if (type_item.indexOf('file')>-1)
					{	addItem=true;}
				}
				field_title='';
				if (addSection === true)
					field_title+=sort_info.title_on_table_flex_section;
				if (addItem === true)
				{
					if (field_title !== '')
						field_title += ' / ';
					field_title+=sort_info.title_on_table_flex_file;
				}

				addListDir = (addSection && addItem) ? true : false;


			}
			var field_sortable = 
				'<span data-sort="'+sort_info.id+'">'+
					'<i class="'+icon_fa+' fa-inverse" aria-hidden="true"></i>'+field_title+
				'</span>';

			//add content html
			contentTableFlex_heading_start = contentTableFlex_heading_start +			
				'<li class="row heading">' +
					'<div class="col-xs-'+max_col_xs+' col-sm-'+col_sm_title_fields+'">' +
						'<div class="col-xs-'+col_xs_title+' col-sm-'+col_sm_title+' title-table">'+
							field_sortable+
						'</div>';

			contentTableFlex_heading_end = contentTableFlex_heading_end +
					'</div>'+
					'<div class=" hidden-xs col-sm-'+col_sm_actions+'">'+
						SortableConfigRef.config_with_tableflex.actions_title_on_table_flex+
					'</div>'+
				'</li>';
		}

		if (!(filter_sortable_fields === true)) 
		{
			//add first field after title : depend sortable_type_ref_section
			if ((sort_info.id === sortable_type_ref_section) && (max_field < max_field_ref))
			{
				if (sort_info.show_on_table_flex === true)
				{
					tableFieldId.push(sort_info.id);
					max_field++;

					// note: field_sortable, add class selected_sort on first field by default	
					var field_sortable = 
						'<span data-sort="'+ sort_info.id +'" class="'+ class_selected_sort +'">'+
							'<i class="'+icon_fa+' " aria-hidden="true"></i>'+sort_info.title_on_table_flex +
						'</span>';					

					contentTableFlex_heading_start = contentTableFlex_heading_start +
						'<div class="col-xs-'+col_xs_first_field+' col-sm-'+col_sm_field+'">'+field_sortable+'</div>';				
				}
			}
		}
	});
	if (!(filter_sortable_fields === true)) 
	{
		//add last filed heading
		SortableConfigRef.list_sort_type.forEach(function(sort_info, index_sort) 
		{
			if (sort_info.show_on_table_flex === true)
			{
				if ((index_sort > 0)  && (sort_info.id !== sortable_type_ref_section) && (max_field < max_field_ref))
				{					
					var field_sortable = 
						'<span data-sort="'+sort_info.id+'">'+
							'<i class="'+icon_fa+' fa-inverse" aria-hidden="true"></i>'+sort_info.title_on_table_flex+
						'</span>';										

					contentTableFlex_heading_start = contentTableFlex_heading_start +
							'<div class="hidden-xs col-sm-'+col_sm_field+'">'+field_sortable+'</div>';

					tableFieldId.push(sort_info.id);
					max_field++;
				}
			}
		});
	}

	if (_lang === 'fr') {
		moment.locale('fr');
	}else {
		moment.locale('en');
	}
	
	var raw_format_moment=['Y-MM-DD HH-mm-ss'];
	//--------------------------------------------
	// content table flex with sortable fields
	//--------------------------------------------
	var contentTableFlex_dir = '';
	var contentTableFlex_items = '';

	for (var iter_items = 0; iter_items < currentItemsTableFlex_index; iter_items++) {
		
		var type_item = currentItemsTableFlex["type_item"][iter_items];
		var display_title = currentItemsTableFlex["display_title"][iter_items];
		var display_heading = currentItemsTableFlex["display_heading"][iter_items];
		var display_action = currentItemsTableFlex["display_action"][iter_items];
		var data_list = currentItemsTableFlex["data_list"][iter_items];

		var contentTableFlex_item = '';

		var config_fa = ' fa-fw fa-lg';
		
		//default display title
		var display_title_field = display_title;

		if (type_item.indexOf('empty')>-1) 
		{
			if (type_item === 'empty_dir')
			{
				var font_fa = 'fa fa-eye-slash';
				var title_detail = '';

				display_title_field = '<span title="'+title_detail+'" ' +'>'+
						'<i class="'+font_fa+config_fa+'" aria-hidden="true"></i>&nbsp;'+display_title+'</span>';	
			}
			if (type_item === 'empty_file')
			{
				var font_fa = 'fa fa-eye-slash';
				var title_detail = '';

				display_title_field = '<span title="'+title_detail+'" ' +'>'+
						'<i class="'+font_fa+config_fa+'" aria-hidden="true"></i>&nbsp;'+display_title+'</span>';	
			}
		}
		else
		{
			// if (type_item === 'dir' || type_item === 'admin_dir' || type_item === 'tree' ||
			// type_item === 'file' || type_item === 'admin_file' )
			// {	}
			//config dir
			var font_fa = 'fa fa-eye';
			var title_detail = 'View items on section '+ display_title;
			var class_admin = (type_item.indexOf('admin_')===0)? 'admin' : '';
			
			if (type_item === 'file' || type_item === 'admin_file' || type_item.indexOf('_textcontent')>-1)
			{	//config file / item
				font_fa = 'fa fa-pencil';
				title_detail = 'Edit content';
			}

			display_title_field = 
				'<div class="actions">'+
					'<span class="titleFile '+class_admin+'" title="'+title_detail+'" ' + data_list +'>'+
					'<i class="'+font_fa+config_fa+'" aria-hidden="true"></i>&nbsp;'+display_title+'</span>'+
				'</div>';			
		}

		
		
	
		//note : filter outside with 'empty_dir','empty_file'

		// heading row + title field
		contentTableFlex_item = contentTableFlex_item + 
			'<li class="row '+ display_heading +'">'+
				'<div class="col-xs-'+max_col_xs+' col-sm-'+col_sm_title_fields+'">'+
					'<div class="col-xs-'+col_xs_title+' col-sm-'+col_sm_title+' title-table">'+ display_title_field +'</div>';


		if (!(filter_sortable_fields === true)) 
		{
			//add sortable fields
			var current_items = iter_items;
			for (var iter_field = 0; iter_field < max_field; iter_field++) {
			
				var fieldId = tableFieldId[iter_field];
				var value = currentItemsSortable[fieldId][iter_items];			
				
				//extra filtering :
				var type_value = '';
				var table_flex_type_value='';
				SortableConfigRef.list_sort_type.forEach(function(sort_info, index_sort) 
				{
					if (sort_info.id === fieldId)
					{					
						type_value = sort_info.type;	
						table_flex_type_value = sort_info.table_flex_type;											
					}
				});

				//specific 'last_modified' !!
				// if value is undefined, take date-publication as ref, config last_modified_undef_date_ref
				if ((fieldId === 'last_modified') && (value === undefined))
				{
					var id_date_ref = SortableConfigRef.config_with_tableflex.last_modified_undef_date_ref;
					if ((id_date_ref !== undefined) && (currentItemsSortable[id_date_ref] !== undefined)) 
					{
						value = currentItemsSortable[id_date_ref][iter_items];
					}
				}


				if (value === undefined) 
				{
					value='';
				}
				else
				{
					if (type_value === 'date')
					{
						var moment_date = moment(value,raw_format_moment);

						if (fieldId === 'last_modified')
						{
							//add one hour
							moment_date.add(1, 'hour');
						}

						var date_detail = moment_date.format('DD MMMM Y, HH:mm:ss');
						if (table_flex_type_value === 'moment_date')
						{
							var date_display;
							if (Default_lang === 'fr') {
								date_display = moment_date.format('DD MMM Y');	
							} else {
								date_display = moment_date.format('MMM DD, Y');	
							}
													
							value='<span title="'+date_detail+'">'+date_display+'</span>';
						}					
					
						if (table_flex_type_value === 'moment_from_now')
						{
							var date_display = moment(moment_date,raw_format_moment).fromNow();
							value='<span title="'+date_detail+'">'+date_display+'</span>';
						}
					}
				}//end else (value === undefined), filtering type	

				//first field
				if (iter_field == 0)
				{
					contentTableFlex_item = contentTableFlex_item + 
						'<div class="col-xs-'+col_xs_first_field+' col-sm-'+col_sm_field+'">' + value + '</div>';
				}			
				else
				{					
					contentTableFlex_item = contentTableFlex_item +
						'<div class="hidden-xs col-sm-'+col_sm_field+'">' + value + '</div>';				
				}
			}//end iter fields

		}//end test !(filter_sortable_fields === true)

		//close title + sortable fields
		contentTableFlex_item = contentTableFlex_item +
			'</div>';

		// add actions field
		contentTableFlex_item = contentTableFlex_item + 
				'<div class="col-xs-'+max_col_xs+' col-sm-'+col_sm_actions+' ">'+				
					'<div class="actions">'+
					 	display_action + 
					'</div>'+
				'</div>';

		// close row
		contentTableFlex_item = contentTableFlex_item +
			'</li>';

		var isTypeDir = type_item === 'dir' || type_item === 'admin_dir' || type_item === 'tree' || type_item === 'empty_dir';
		if (addListDir && isTypeDir) 
		{
			//add to list dir
			contentTableFlex_dir += contentTableFlex_item;
		}
		else{
			//add to list items
			contentTableFlex_items += contentTableFlex_item;
		}
		
	}	


	//-------------------------------
	// add table flex to element_html
	contentTableFlex = 
		'<ul class="table-flex col-xs-'+max_col_xs+'" id="listFields">' + 
			contentTableFlex_heading_start + 
			contentTableFlex_heading_end +
		'</ul>';
	//add dir part, if needed, case dir + items
	if (contentTableFlex_dir !== '') 
	{
		contentTableFlex +=		
			'<ul class="table-flex col-xs-'+max_col_xs+'" id="listDirItems">' + 
				contentTableFlex_dir +
			'</ul>';
	}
	//add items part
	contentTableFlex +=		
		'<ul class="table-flex col-xs-'+max_col_xs+'" id="listItems">' + 
			contentTableFlex_items +
		'</ul>';

	$(element_html).append(contentTableFlex);

}

//add event on click heading fields
var toggle_field=false;
$('body').on('click', '.table-flex .heading [data-sort]', function(event){

	var class_selected_sort=SortableConfigRef.config_with_tableflex.class_field_sort_selected;
	var elt_fa = '.table-flex .'+class_selected_sort+' .fa';

	if (currentStoreSection_gl == undefined)
			return;
	
	sortable_sort_stype_gl=$(this).attr('data-sort');
	var order = Array.from(currentStoreSection_gl[sortable_sort_stype_gl]);


	if ($(this).hasClass(class_selected_sort))
	{
		
		if (!toggle_field){
			order = order.reverse();
			$(elt_fa).addClass('fa-rotate-180');
		}		
		else
		{
			$(elt_fa).removeClass('fa-rotate-180');
		}
		toggle_field=!toggle_field;		
	}
	else
	{
		$(this).parents().find(elt_fa).removeClass('fa-rotate-180').addClass('fa-inverse');
		$(this).parents().find('span').removeClass(class_selected_sort);

		$(this).addClass(class_selected_sort);	
		$(elt_fa).removeClass('fa-inverse');

		toggle_field=false;
	}
	sortable.sort(order);

});


// sub fn loop OpenSection
function tableFlexOnOpenSection_init_loop()
{
	currentItemsTableFlex = {};
	currentItemsTableFlex["type_item"] = [];
	currentItemsTableFlex["display_heading"] = [];
	currentItemsTableFlex["display_title"] = [];
	currentItemsTableFlex["display_action"] = [];
	currentItemsTableFlex["data_list"] = [];
	currentItemsTableFlex_index=0;
}

function tableFlexOnOpenSection_on_loop(type_item,display_heading,display_title,display_action,data_list) 
{
	currentItemsTableFlex["type_item"][currentItemsTableFlex_index] = type_item;
	currentItemsTableFlex["display_heading"][currentItemsTableFlex_index] = display_heading;
	currentItemsTableFlex["display_title"][currentItemsTableFlex_index] = display_title;
	currentItemsTableFlex["display_action"][currentItemsTableFlex_index] = display_action;
	currentItemsTableFlex["data_list"][currentItemsTableFlex_index] = data_list;
	currentItemsTableFlex_index++;
}

