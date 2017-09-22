// variables global
var sortable; //see singleton todo
var currentItemsSortable={};
var currentItemsSortable_index=0;
var sortable_type_ref_section=SortableConfigRef.config.default_sort_section_not_defined;
var sortable_name_gl;
var sortable_sort_stype_gl;
var currentStoreSection_gl;
var update_value_sortable_saveChanges;


//note, need to add html ref
// var sortable_class = SortableConfigRef.config.class_ref_item;
// var sortable_id = SortableConfigRef.config.id_index_ref_item+'="'+index+'"';

// config define in : public/config/config_sortable_default.js

//from https://github.com/RubaXa/Sortable


function sortableOnOpenSection(sortable_group)
{
	var list_sort_type = SortableConfigRef.list_sort_type;
	var _options = '';
	sortable_sort_stype_gl = '';

	var id_select_ref = '#'+SortableConfigRef.config.id_select_ref;
	var id_form_ref = '#'+SortableConfigRef.config.id_form_ref;


	list_sort_type.forEach(function(sort_info, index_sort) 
	{
		if (index_sort === 0) {
			sortable_sort_stype_gl=sort_info.id;
		}
		if (sort_info.id === sortable_type_ref_section) 
		{
			sortable_sort_stype_gl = sort_info.id;
			//---- html display select ----
			if (sort_info.show_on_select === true) {
				_options=_options + 
					'<option value="'+sort_info.id+'" selected>' + sort_info.trad_editor + '</option>';
			}										
		}
	});

	//---- html display select, complete option with common sort ----
	list_sort_type.forEach(function(sort_info) 
	{								
		if (sort_info.id !== sortable_sort_stype_gl && sort_info.display_depend_section_ref === false && sort_info.show_on_select === true) 
		{
			_options=_options + 
				'<option value="'+sort_info.id+'">' + sort_info.trad_editor + '</option>';
		}
	});
	$(id_select_ref).empty();
	$(id_select_ref).append(_options);

	// $(id_form_ref).removeClass(SortableConfigRef.config.class_invisible);
	// todo : add select on small width, decomment previous


	// var globale !! to limit call to localstorage.getitem
	currentStoreSection_gl = JSON.parse(localStorage.getItem(sortable_group) || '{}');
	//verif si modif in current items, comparing to store, 
	//use last_modified signature; if difference, new init!
	var storeResetUpdate = false;
	if (Object.keys(currentStoreSection_gl).length > 0)
	{
		storeResetUpdate=sortableResetStoreUpdatedSection(sortable_group);
	}
	if (Object.keys(currentStoreSection_gl).length === 0 || storeResetUpdate === true)
	{
		sortableInitCurrentSection(sortable_group);
	}							

	var sortable_options={};
	sortable_options.group = sortable_group;
	Sortable.utils.extend(sortable_options,sortable_comon_options);

	var elementSortable = document.getElementById(SortableConfigRef.config.id_content_display_items);
	sortable = Sortable.create(elementSortable, sortable_options);	
	// note : id from html : <div class="content" id="listItems"></div>							

	//events on sortable
	// var switcherListItems = document.getElementById("switcherListItems");
	// switcherListItems.onclick = function () {
	// 	var state = sortable.option("disabled"); // get
	// 	sortable.option("disabled", !state); // set
	// 	switcherListItems.innerHTML = state ? 'disable' : 'enable';
	// };

	// sortable.destroy();


}


// sub fn loop OpenSection
function sortableOnOpenSection_init_loop()
{
	currentItemsSortable = {};
	sortable_type_ref_section=SortableConfigRef.config.default_sort_section_not_defined;
}

function sortableOnOpenSection_get_section_ref(raw_info,index_raw)
{
	var key_sortable=SortableConfigRef.config.key_section_ref_sort;
	if (raw_info[index_raw][key_sortable]!==undefined)
	{
		sortable_type_ref_section = raw_info[index_raw][key_sortable];
	}
}

function sortableOnOpenSection_on_loop(raw_info,index_raw) {

	var list_sort_type = SortableConfigRef.list_sort_type;

	//init global object currentItemsSortable
	if (Object.keys(currentItemsSortable).length === 0) 
	{		
		currentItemsSortable_index=0;
		list_sort_type.forEach(function(sort_info, index) 
		{
			currentItemsSortable[sort_info.id] = [];			
		});
	}	
	list_sort_type.forEach(function(sort_info, index) 
	{



		if (index === 0) 
		{
			currentItemsSortable[sort_info.id][currentItemsSortable_index] = index_raw.toString();
		}
		else
		{
			var raw_value = raw_info[index_raw][sort_info.id];			
			//custom filter
			if (sort_info.id === 'date-publication' && raw_value === undefined) {
				//case post, force to 'date'
				raw_value = raw_info[index_raw]['date']
			}
			else if (sort_info.id === 'order' && raw_value === undefined) {
				//case post, force to 'date'
				raw_value = '1';
			}
			currentItemsSortable[sort_info.id][currentItemsSortable_index] = raw_value;
		}	
	});
	currentItemsSortable_index++;
}


//fn visibility form
function sortableFormVisible()
{
	var id_form_ref = '#'+SortableConfigRef.config.id_form_ref;
	$(id_form_ref).removeClass(SortableConfigRef.config.class_invisible);
}

function sortableFormInvisible()
{
	var id_form_ref = '#'+SortableConfigRef.config.id_form_ref;
	$(id_form_ref).addClass(SortableConfigRef.config.class_invisible);
}


// Sortable options

var sortable_comon_options = {
	sort: true,
	disabled: true, // Disables the sortable if set to true.
	dataIdAttr: SortableConfigRef.config.id_index_ref_item,
	// filter: '.js-edit, .js-remove', 
	onEnd: function (event) {
		sortable_name_gl = sortable.options.group.name;
	},
	setData: function (/** DataTransfer */dataTransfer, /** HTMLElement*/dragEl) {
		dataTransfer.setData('Text', dragEl.textContent); // `dataTransfer` object of HTML5 DragEvent
	},

	// Element is chosen
	onChoose: function (/**Event*/evt) {
		evt.oldIndex;  // element index within parent
	},

	// Element dragging started
	onStart: function (/**Event*/evt) {
		evt.oldIndex;  // element index within parent
	},
	// Element is dropped into the list from another list
	onAdd: function (/**Event*/evt) {
		var itemEl = evt.item;  // dragged HTMLElement
		evt.from;  // previous list
		// + indexes from onEnd
	},

	// Changed sorting within list
	onUpdate: function (/**Event*/evt) {
		var itemEl = evt.item;  // dragged HTMLElement
		// + indexes from onEnd
	},

	// Called by any change to the list (add / update / remove)
	onSort: function (/**Event*/evt) {
		// same properties as onUpdate
		var itemEl = evt.item;
	},

	// Element is removed from the list into another list
	onRemove: function (/**Event*/evt) {
		// same properties as onUpdate
	},
  // onFilter: function (evt) {
  //   // var el = editableList.closest(evt.item); // get dragged item
  //   // el && el.parentNode.removeChild(el);
  //   var ctrl = evt.target;    
  //   var item = evt.item;
  //   var from = evt.from;
  //   if (Sortable.utils.is(ctrl, '.js-remove')) {
  //     // evt.from.removeChild(evt.item);
  //   }
  //   else {
  //   	var el = evt.item.firstElementChild,
  //   		name = el.innerHTML;
  //     // el.innerHTML = prompt("test:", name);
  //   }
  // },
	store: {		
		get: function (sortable) {			
			// var order = localStorage.getItem(sortable.options.group.name);
			// return order ? order.split('|') : [];
			return currentStoreSection_gl[sortable_sort_stype_gl];
		},
		set: function (sortable) {
			// var order = sortable.toArray();
			// localStorage.setItem(sortable_name_gl, order.join('|'));
		}
	}
};


// Sortable functions

function sortableResetStoreUpdatedSection(sortable_group)
{
	var list_sort_type = SortableConfigRef.list_sort_type;
	var detect_modif = false;

	if (Object.keys(currentItemsSortable).length===0)
	{
		detect_modif = true;
	}
	else 
	{
		list_sort_type.forEach(function(sort_info, index) 
		{
			if (sort_info.field_ref_update !== undefined)
			{
				var update_store='';
				if (currentStoreSection_gl[sort_info.field_ref_update] !== undefined) {
					update_store = currentStoreSection_gl[sort_info.field_ref_update].join('|');
				}				
				var update_current = currentItemsSortable[sort_info.id].join('|');
				if (update_store !== update_current) 
				{
					detect_modif = true;
				}		
			}
		});
	}
	if (detect_modif === true) 
	{
		//destroy localStorage for this section
		localStorage.removeItem(sortable_group);	
	}
	return detect_modif;


}


function sortableInitCurrentSection(sortable_group) 
{
	var list_sort_type = SortableConfigRef.list_sort_type;
	var name_default;
	var group_name_default;
	
	//init current store section
	currentStoreSection_gl = {};

	//-----------------------------------
	//store default, first of the list
	list_sort_type.forEach(function(sort_info, index,array) 
	{
		if (index === 0)
		{
			name_default = sort_info.id;
			currentStoreSection_gl[sort_info.id] = currentItemsSortable[sort_info.id];	
		}

		if (index > 0)
		{

			var list_default_sort = [];
			if (Object.keys(currentItemsSortable).length>0) 
			{
				list_default_sort=Array.from(currentItemsSortable[name_default]);
			}
			

			//-----------------------
			var list_to_sort = [];

			if (sort_info.type === 'date') {
				var now = moment().format('x');
				var format_moment=['Y-MM-DD HH-mm-ss'];
			}

			if (Object.keys(currentItemsSortable).length>0) 
			{
				currentItemsSortable[sort_info.id].forEach(function(value, index) {

					if (sort_info.type === 'integer') {
						list_to_sort[index] = parseInt(value);
					}

					if (sort_info.type === 'date') {
						var diff_unix = now;
						if (value !== undefined)
						{
							var moment_date = moment(value,format_moment);
							diff_unix = now - moment_date.format('x');
						}
						list_to_sort[index] = parseInt(diff_unix);
					}

					if (sort_info.type === 'default') {
						list_to_sort[index] = list_default_sort[index];
					}
				});
			}

			//-----------------------			
			var result;
			var order =list_to_sort;

			if (sort_info.type === 'integer')
			{
				if (sort_info.asc_order === true) {
					result =  sort_2tables_asc(list_to_sort,list_default_sort);
				}
				else {
					result =  sort_2tables_desc(list_to_sort,list_default_sort);
				}
				order =result[1];
			}

			if (sort_info.type === 'date')
			{ //inv logic, with diff from now
				if (sort_info.asc_order === true) {
					result =  sort_2tables_desc(list_to_sort,list_default_sort);
				}
				else {
					result =  sort_2tables_asc(list_to_sort,list_default_sort);
				}
				order =result[1];
			}

			currentStoreSection_gl[sort_info.id] = order;

			//------------------------------
			// extra, update group,  add raw info to compare with current items if update of storing data is needed
			if (sort_info.field_ref_update !== undefined ) 
			{
				currentStoreSection_gl[sort_info.field_ref_update] = currentItemsSortable[sort_info.id];			
			}

		}//end test (index > 0)

		if (index === (array.length-1))
		{
			//update local storage			
			localStorage.setItem(sortable_group, JSON.stringify(currentStoreSection_gl));
			// var test = JSON.parse(localStorage.getItem(sortable_group) || '{}');
		}
	});

}




//extract update_value_sortable
function sortableExtractCurrentUpdateValue(index_default) 
{
	var ref_id_sortable, update_id_sortable;
	var update_value_sortable;
	SortableConfigRef.list_sort_type.forEach(function(sort_info, index) 
	{
		if (index===0) 
			ref_id_sortable = sort_info.id;
		if (sort_info.field_ref_update !== undefined)
			update_id_sortable = sort_info.id;		
	});

	if (currentItemsSortable[ref_id_sortable] !== undefined)
	{
		currentItemsSortable[ref_id_sortable].forEach(function(value, index) {
			if (value === index_default ) 
			{
				update_value_sortable = currentItemsSortable[update_id_sortable][index];
			}
		});
	}
	return update_value_sortable;
	
}

function sortableUpdateFrontMatterWithCurrent(_fm)
{

	var update_id_sortable;
	SortableConfigRef.list_sort_type.forEach(function(sort_info) 
	{		
		if (sort_info.field_ref_update !== undefined)
			update_id_sortable = sort_info.id;		
	});

	var current_update_value = update_value_sortable_saveChanges; //var gl

	//update metadata value, specific last_modified
	if (update_id_sortable === 'last_modified')
	{
		var new_last_modified = 'last_modified : '+ CurrentDateTimeUtc(); //force datetime int
		var add_new_meta = true;
		if (current_update_value !== undefined)
		{
			var regex_date = current_update_value.replace(' ','\s');
			var regex_lastmodif = /last_modified\s*:\s*\d{2,4}-\d{1,2}-\d{1,2}\s\d{1,2}-\d{1,2}-\d{1,2}/;

			if (_fm.search(regex_lastmodif) > -1)
			{
				_fm =_fm.replace(regex_lastmodif,new_last_modified);
				add_new_meta = false;
			}
		}
		if (add_new_meta)
		{			
			_fm = _fm + '\n' + new_last_modified + '\n';
		}
	}

	return _fm;

}


//sort fn
function sort_2tables_desc(tab1,tab2) {
	// output order : 6-5-4-3-2-1
	var tab1_sort = tab1;
	var tab2_sort = tab2;
	var nbEltTab1 = tab1_sort.length;
	var nbEltTab1Minus = nbEltTab1 - 1;

	for (var i = 0; i < nbEltTab1Minus; i++)
	{
		var debIndex = i + 1;
		for (var j = debIndex; j < nbEltTab1; j++)
		{
			tab1_i = parseInt(tab1_sort[i]);
			tab1_j = parseInt(tab1_sort[j]);

			if (tab1_i < tab1_j)
			{
				tab1_sort[i]=tab1_j;
				tab1_sort[j]=tab1_i;

				tab2_i = tab2_sort[i];
				tab2_j = tab2_sort[j];

				tab2_sort[i]=tab2_j;
				tab2_sort[j]=tab2_i;
			}			    			   			
		}		    			   			
	}
	return [tab1_sort,tab2_sort];
}
function sort_2tables_asc(tab1,tab2) {
	// output order : 1-2-3-4-5-6
	var tab1_sort = tab1;
	var tab2_sort = tab2;
	var nbEltTab1 = tab1_sort.length;
	var nbEltTab1Minus = nbEltTab1 - 1;

	for (var i = 0; i < nbEltTab1Minus; i++)
	{
		var debIndex = i + 1;
		for (var j = debIndex; j < nbEltTab1; j++)
		{
			tab1_i = parseInt(tab1_sort[i]);
			tab1_j = parseInt(tab1_sort[j]);

			if (tab1_i > tab1_j)
			{
				tab1_sort[i]=tab1_j;
				tab1_sort[j]=tab1_i;

				tab2_i = tab2_sort[i];
				tab2_j = tab2_sort[j];

				tab2_sort[i]=tab2_j;
				tab2_sort[j]=tab2_i;
			}			    			   			
		}		    			   			
	}
	return [tab1_sort,tab2_sort];
}