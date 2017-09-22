//reglage admin

var Git_refs_heads = 'update';
var Git_refs_heads_master = 'master';

var port_ws_pullLocalRepo = ':8100';
var port_ws_previewLocalRepo = ':8101';

var port_preview_site = ':4000';

var section_include_content = '{% include coll_ext/main.html %}'; //collection_extV1 ref

var fa_default = 'fa-address-book';//first of the list!

var file_new_folder_img_gl= 'init_empty_folder_do_not_del.txt';



// global variables 

var UserLogin;
var RepoUrl;
var CurrentName;
var CurrentPath='';
var CurrentPathImage='';
var site_mode_admin_gl=false;
var CommitMsg = '';
var SaveBtn = '<button type="button" class="btn btn-success" disabled></button>';
var InsertImage;
var FrontMatter;
var CallerMdImageModal='';
var KeyMdImageModal='';
var PrefClassMdImageModal='key-';
var SufixIdCheckedInput='-check';
var SufixIdCheckedFormImage='-image';
var SufixIdCheckedFormComment='-comment';
var ValueMetadatePost="";//info to update file in _posts type 2017-01-10-{title}
var currentCommentImage_gl={};
var currentLabelMdImage_gl={};
var currentCheckedId_gl={};
var currentCheckedImage_gl={};
var currentItemsTableFlex={};
var activeCustomModeImg_gl=false;
var adaptCustomPathImg_gl='';

var change_min_image_gl = ''; // fn changeTypeImageIconDependOn
var change_min_fa_gl = ''; // variables to buff local change before create


var octo = new Octokat({
	token: AccessToken
});
var octoRepo;

var Current_git_items_tree=[];
var Current_raw_info_fm_items_tree=[];
var Current_raw_info_fm_section_ref={};
var index_current_raw_section_ref=-1;
var index_current_raw_item_ref=-1;

var Current_nb_elt_folder_tree=[];
var Current_nb_elt_folder_tree_path=[];
var editor;

var Current_git_item={};
var Current_info_fm_item={};
var Current_raw_info_fm_item={};

var ModifiedFilename='';
var ModifiedContent='';
var Filename_ext_timestamp;
var PageFilename;

var ModelsFmItemFilter={};
var ModelsFmSectionFilter={};

var PathsFmCreateItem=[];
var PathsFmModifyOnlyItem=[];
var PathsFmCustomImgItem=[];

var PathsFmCreateButtonSection=[];
var PathsFmCreateModifySection=[];
var PathsFmCanDeleteSection=[];
var PathsFmAdminHideMetaSection=[];
var PathsFmTextContentSection=[];
var PathsFmAddPathImgSection=[];
var PathsFmSectionsWithFileActions=[];


var cb = function (err, val) { console.log(val); };
octo.zen.read(cb);

var add_zen = function (err, val) {
	$('.zen-words').empty();
	if (err === null) 
		$('.zen-words').append('<h6>'+val+'</h6>');			
};

//+++++++++++++++++
// init websocket +
//+++++++++++++++++
// websocket dedicated to pull local repo
var ws_pullLocalRepo = 'ws://' + window.location.host.replace( /:\d{2,4}$/,'')+ port_ws_pullLocalRepo;
var wsGit = new WebSocket(ws_pullLocalRepo);
wsGit.onmessage=function(event) { 
	var message = JSON.parse(event.data);
	if(message.type==='text') { 		
		if(message.content==='git_repo_ready') 
		{
			//action on preview site via ws and btn preview disabled, activeBtnPreviewSite 
			StartIntervalPreview();
		
			// $('.loading, .noclick').toggle();
			$('.noclick').toggle();
			document.getElementById('spinner-git-cancel').classList.add("u-hidden");
			$('#CancelUpdateSuccess').modal('toggle');		
		}
		if(message.content==='git_production_ready') 
		{
			$('.noclick').toggle();
			document.getElementById('spinner-git-update').classList.add("u-hidden");			
			$('#updateSite').modal('toggle');
			$('#UpdateSuccess').modal('toggle');
			initShowRoot();			
		}
		if (message.content==='git_preview_under_build') 
		{
			var preview_ref_class = document.getElementById('previewsite-id').classList.value;
			var icon_ref_class = document.getElementById('previewsite-id').getElementsByTagName("i")[0].classList.value;
			if ((preview_ref_class.indexOf('btn-success')>-1)&&(icon_ref_class.indexOf('fa-pulse')===-1))
			{
				WaitingPreviewBuildReady();					
			}
		}

	}
};
function UpdateLocalRepo() {
	setTimeout(function() {
        wsGit.send('{ "type": "text", "content":"Update_git"}'); 
    }, 50);	
}
function ReinitLocalRepo() {
	setTimeout(function() {
        wsGit.send('{ "type": "text", "content":"Reinit_git"}'); 
    }, 50);	
}
function ReinitForceCloneLocalRepo() {
	setTimeout(function() {
        wsGit.send('{ "type": "text", "content":"Reinit_force_clone"}'); 
    }, 50);	
}

function UpdateGhPagesRepo() {
	setTimeout(function() {
        wsGit.send('{ "type": "text", "content":"Update_production_git"}'); 
    }, 50);	
}

//++++++++++++
// websocket dedicated to preview local repo, enabled/ disabled preview button on init, and cancel update action
var ws_previewLocalRepo = 'ws://' + window.location.host.replace( /:\d{2,4}$/,'')+ port_ws_previewLocalRepo;
var wsPreview = new WebSocket(ws_previewLocalRepo);

wsPreview.onmessage=function(event) { 
	var message = JSON.parse(event.data);
	if(message.type==="text") 
	{
		//console.log('message.content :'+message.content);
 		if (message.content==='preview_ready') 
 		{
			StopIntervalPreview();
			//enabled btn preview site
			activeBtnPreviewSite('previewsite-id', true,true,"preview site on click!");
		}
		else if (message.content==='preview_awaiting_construction') 
		{
				//disabled btn preview site with message on construction
				activeBtnPreviewSite('previewsite-id', false,true,"preview site on construction!");
		}
		else if (message.content==='preview_awaiting_must_restart') 
		{
				//disabled btn preview site with message must restart local server
				activeBtnPreviewSite('previewsite-id', false,true,"Local updates deleted. Need to restart local server!");
				document.getElementById('spinner-restart').classList.remove("u-hidden");			
		}
		else if (message.content==='preview_build_ready') 
 		{
 			activeBtnPreviewSite('previewsite-id', true,true,"preview site on click!");					
		}
		else if (message.content==='preview_build_not_ready') 
 		{
 			activeBtnPreviewSite('previewsite-id',true,false,"Building last update. Previous preview on click!");						
		}
	}
};

function StopIntervalPreview() {
	setTimeout(function() {
        wsPreview.send('{ "type": "text", "content":"Stop_interval_preview"}'); 
    }, 50);	
}
function StartIntervalPreview() {
	setTimeout(function() {
        wsPreview.send('{ "type": "text", "content":"Interval_preview_init"}'); 
    }, 50);	
}
function WaitingPreviewBuildReady() {
	setTimeout(function() {
        wsPreview.send('{ "type": "text", "content":"Waiting_preview_build_ready"}'); 
    }, 50);	
}




//+++++++++++++++++++++++++++++++++++++++++++
// Entry point : get current user info    +++
//+++++++++++++++++++++++++++++++++++++++++++

CurrentUserOcto(function(err,data) {
	UserLogin = data.login;
	// $(".avatar").attr('src', data.avatarUrl);
	var add_icon = ' <i class="fa fa-github fa-2x" aria-hidden="true">&nbsp;</i>';
	if(data.name === null){
		$(".user-name").html('<a href="'+data.htmlUrl+'" target="_blank">'+
			add_icon + data.login + ' / </a>');
	}else{
		$(".user-name").html('<a href="'+data.htmlUrl+'" target="_blank">' +
			add_icon + data.name + ' / </a>');
	}

	 initAdminMode();

	//init octo in current rep, with access token
	octoRepo=octo.repos(UserLogin,Git_repoName);
	RepoUrl = UserLogin.toLowerCase() + '.github.io' + '/' + Git_repoName;

	initShowRoot();
	
});

function initShowRoot() {
	// get the current commit id of refs heads master
	octoRepo.git.refs.heads(Git_refs_heads_master).fetch(
		function (err, val) {
			
			CurrentRefsHeadsMasterCommitSha=val.object.sha;
			CurrentRefsHeadsCommitSha=val.object.sha;
			
			// $('#commit').attr('placeholder', CommitMsg + UserLogin);
			octoRepo.git.refs.heads(Git_refs_heads).fetch(
				function (err, val) {
					// console.log('err : ' +err+', val : '+val);
					if(val!==undefined) {
						CurrentRefsHeadsCommitSha=val.object.sha;
						console.log('branch maj existe');
						if(CurrentRefsHeadsCommitSha !== CurrentRefsHeadsMasterCommitSha)
						{
							console.log('maj en cours, clic pour la liste des commits');
						}
						else {
							console.log('maj - à jour avec version en production');						 	
						}
						ShowRoot();	
					}
					else {
						octoRepo.git.refs.create({ref: 'refs/heads/'+Git_refs_heads, sha: CurrentRefsHeadsMasterCommitSha}).then(
							function(){
								console.log('branch maj créée - à jour avec version en production');
								ShowRoot();
								return;
							}
						);					
					}					
				}
			);
		}
	);	

}


//Show user website
function ShowRoot() {

	$('body').attr('data-content', 'sites');
	$('header .url, aside .list .title, aside ul, main .content, main .images').empty();
	$('.breadcrumb .show-root').nextAll().remove();
	if($('.loading').is(':hidden')){
		$('.loading, .noclick').toggle();
	}	
	initBtnShowListAction();

	//-------------------------------------------------------------------------------------------
	//extract info model, list paths of section where can create items 
	ModelsFmItemFilter = $.extend(true, {}, ModelsFmItemFilterRef);
	PathsFmCreateItem = extractPathsModelFm(ModelsFmItemFilter);
	//extract info model, list paths of section where can only modify items
	ModelsFmItemFilter = $.extend(true, {}, ModelsFmItemFilterRef);
	PathsFmModifyOnlyItem = extractPathsModelFmCreateOnly(ModelsFmItemFilter,true);
	//extract info model, list paths of section where a custom mode image defined
	ModelsFmItemFilter = $.extend(true, {}, ModelsFmItemFilterRef);
	PathsFmCustomImgItem = extractPathsModelFm_KeyValue(ModelsFmItemFilter,'customModeImage');

	//extract info model, list paths of section: create section, filering path to display or not button createsection
	ModelsFmSectionFilter = $.extend(true, {}, ModelsFmSectionFilterRef);
	PathsFmCreateButtonSection = extractPathsModelFmCreateOnly(ModelsFmSectionFilter);
	//extract info model, list paths of section : create AND MODIFY a section
	ModelsFmSectionFilter = $.extend(true, {}, ModelsFmSectionFilterRef);
	PathsFmCreateModifySection = extractPathsModelFm(ModelsFmSectionFilter);
	//extract info model, list paths of section : add delete btn if section is empty
	ModelsFmSectionFilter = $.extend(true, {}, ModelsFmSectionFilterRef);
	PathsFmCanDeleteSection = extractPathsModelFm_KeyBoolIsRef(ModelsFmSectionFilter,'show_btn_delete_if_empty',true);
	//extract info model, list paths of section : show section on mode admin only
	ModelsFmSectionFilter = $.extend(true, {}, ModelsFmSectionFilterRef);
	PathsFmAdminHideMetaSection = extractPathsModelFm_KeyBoolIsRef(ModelsFmSectionFilter,'filter_meta_mode_admin',true);
	//extract info model, list paths of section : show section with text content
	ModelsFmSectionFilter = $.extend(true, {}, ModelsFmSectionFilterRef);
	PathsFmTextContentSection = extractPathsModelFm_KeyBoolIsRef(ModelsFmSectionFilter,'section_with_text_content',true);
	//extract info model, list paths of section : add the current section title on the path image
	ModelsFmSectionFilter = $.extend(true, {}, ModelsFmSectionFilterRef);
	PathsFmAddPathImgSection = extractPathsModelFm_pathImg(ModelsFmSectionFilter);
	//extract info model, list paths of section where to add file actions
	ModelsFmSectionFilter = $.extend(true, {}, ModelsFmSectionFilterRef);
	PathsFmSectionsWithFileActions = extractPathsModelFm_KeyValue(ModelsFmSectionFilter,'section_with_file_actions_template_page_pref');

	
		

	// get the current commit id of refs heads
	octoRepo.git.refs.heads(Git_refs_heads).fetch(
		function (err, val) {
			CurrentRefsHeadsCommitSha=val.object.sha;
			
			Root();
			if($('.loading').is(':visible')){
				$('.loading, .noclick').toggle();
			}
		}
	);
}

//breadcrumb root click
$('.show-root').click(function(){
	ShowRoot();
});


//mode administrator : site_mode_admin_gl true/false, in config filter_mode_admin:true/false
function initAdminMode() {
	var add_adminMode = '<i class="fa fa-lock fa-lg " title="Enable Admin Privileges">&nbsp;Admin</i>';
	$('.adminMode').empty();
	$('.adminMode').append(add_adminMode);
}

$('.adminMode').click(function(){

	if ($('.adminMode i').hasClass('fa-lock')) 
	{
		site_mode_admin_gl=true;
		$('.adminMode i').removeClass('fa-lock');
		$('.adminMode i').addClass('fa-unlock');
		$('.adminMode i').attr('title', 'Disable Admin Privileges');
	}
	else
	{
		site_mode_admin_gl=false;
		$('.adminMode i').removeClass('fa-unlock');
		$('.adminMode i').addClass('fa-lock');
		$('.adminMode i').attr('title', 'Enable Admin Privileges');
	}
	ShowRoot();
});



//on tree root, preparation to diplay _blog/blog -> Blog, validate existence of dir, todo:  generalize to n-levels
function tree_filter_folders_two_levels(tree_root,tree_filter) {

	return Promise.all(tree_filter.map(function(item_tree){

		var test_match = item_tree.folderTree.match(/\//g);

		if ( test_match !== null && test_match.length > 1) {
			return undefined;
		}
		else {
			var cut = item_tree.folderTree.indexOf('/');  
			var rootfolder= item_tree.folderTree;
			var search_sha=false;
		    if(cut > -1) {
		    	rootfolder = item_tree.folderTree.substring(0,cut);	    		
		    }
		    tree_root.forEach(function(value) {
		    	if (rootfolder === value.path) {
		    		search_sha=true;
		    	}
		    });	  
		    if (search_sha) {
				return ShaFolder_fetch(encodeURI(item_tree.folderTree),Git_refs_heads).then( function(data) {
					return data;
				});		
			}
			else {
				return undefined;
			}
		}		

	})).then(function(contents){
		return contents ;		
	});	
}

//Show the tree root for a website, main folder to display, no files, or images
//note :  font fa, can use class fa and define css content(depend attr define) : see https://astronautweb.co/snippet/font-awesome/
function Root() {

	$('.loading, .noclick').toggle();
	$('body').attr('data-content', 'tree');
	$('main .content, main .images, aside ul').empty();
	//update header part
	$('.title').empty();
	$('.title').append('<h6>'+Git_repoName+'</h6>');
	octo.zen.read(add_zen);	

	CurrentPath='';
	CurrentName='';
	CurrentPathImage='';

	//test current path : active or not button .create-item / section
	activeBtnCreate(PathsFmCreateItem, CurrentPath, 'create-item-id');
	activeBtnCreate(PathsFmCreateButtonSection, CurrentPath, 'create-section-id');	
	activeBtnUpdate('update-site-id');
	activeBtnUploadImage('upload-image-id');
	hideBtnFileUptodate();
	showBtnId('ShowListAction');
	showBtn$('.main-nav .adminMode');

	activeBtnPreviewSite('previewsite-id',true,true,"preview site on click!");

	//tableflex sortable
	sortableFormInvisible();
	tableFlexOnOpenSection_init_loop();

	TreeRootOcto(Git_refs_heads,function(data) {
		var _title;
		var _type='dir';
		var _path;
	
		tree_filter_folders_two_levels(data,TreeRootFilter.list).then(function(folders_to_display){

				TreeRootFilter.list.forEach(function(value, index,array) {
					if (folders_to_display[index] !== undefined) {

						_title=value.titleOnTree;
						_path=value.folderTree;
						_pathImgHtml='';
						if (value.pathImgTree !== undefined) {
							_pathImgHtml='data-path-img-tree="'+value.pathImgTree+'"';
						}

						//condition display section, depend site_mode_admin_gl, global var
						var _modeAdminFilter = value.filter_mode_admin;
						var display_section = true;
						if (site_mode_admin_gl==false && _modeAdminFilter == true )
							 display_section = false;

						if (display_section) 
						{
							// update items table flex
							var display_title = _title;
							var class_heading = SortableConfigRef.config.class_ref_item + ' data-icon="' + _type;
							var display_action = '';
							var type_item_row = _type;	
							var data_list =	
								' data-type="'+_type+'" data-path="'+_path+'" data-name="'+_path+
									'" data-title="'+encodeURI(_title)+'" '+ _pathImgHtml ;

							var adminContent = (site_mode_admin_gl==true && _modeAdminFilter == true ) ? true : false;
							if (type_item_row==='dir'&&adminContent) 
								{type_item_row='admin_dir'}
							if (type_item_row==='file'&&adminContent) 
								{type_item_row='admin_file'}

							tableFlexOnOpenSection_on_loop(type_item_row,class_heading,display_title,display_action,data_list);

							$('aside ul').append('<li'+ data_list +'>'+	_title +'</li>');	
						}

						//-------------
						// last index
						//-------------
						if (index === (array.length-1) )
						{
							tableFlexOnOpenSection('main .content',true,Default_lang);
						}
					}
				});
				
		});

	});
	// $('.loading, .noclick').toggle();
}

//subfunction active or not createItem, createsection
function activeBtnCreate (list_folders, _current_path, id_btn) {
	var flag_desactive_btn=true;
	list_folders.forEach(function(path_to_create) {

		var update_output = filter_current_path_with_model(_current_path, path_to_create);
		// if (path_to_create===_current_path) {
		if (update_output) {
			flag_desactive_btn=false;
		}
	});
	if (flag_desactive_btn===true) {
		document.getElementById(id_btn).classList.add("u-hidden");
	}
	else {
		document.getElementById(id_btn).classList.remove("u-hidden");	
	}
}
//subfunction active or not update site
function activeBtnUpdate ( id_btn) {
	var flag_desactive_btn=true;
	if(CurrentRefsHeadsCommitSha !== CurrentRefsHeadsMasterCommitSha)
	{
		flag_desactive_btn=false;
	}
	if (flag_desactive_btn===true) {
		document.getElementById(id_btn).classList.add("u-hidden");
	}
	else {
		document.getElementById(id_btn).classList.remove("u-hidden");	
	}
}


//subfunction 
function activeBtnPreviewSite(id_btn, enabled,build_ready=true, message) {

	var elt_ref = document.getElementById(id_btn);
	var icon_ref = elt_ref.getElementsByTagName("i")[0]; //.indexOf('u-hidden') > -1);

	//fixed icon

	if(enabled!==undefined && enabled===true) {
		url_preview_index = 'http://'+window.location.host.replace( /:\d{2,4}$/,'')+port_preview_site+base_url+'/';	
		//console.log('url_preview_index : '+ url_preview_index)		
		elt_ref.setAttribute('href',url_preview_index);
		elt_ref.target="_blank";
		elt_ref.title=message;
		elt_ref.classList.remove("btn-success");
		elt_ref.classList.remove("btn-warning");
		elt_ref.classList.add("btn-success");

		//add spinner if processing build on server
		icon_ref.classList.remove("fa-eye");
		icon_ref.classList.remove("fa-spinner");
		icon_ref.classList.remove("fa-pulse");
		if (build_ready) {
			icon_ref.classList.add("fa-eye");
		}else {
			icon_ref.classList.add("fa-spinner");
			icon_ref.classList.add("fa-pulse");
		}
	}
	else {
		elt_ref.removeAttribute("href"); 
		elt_ref.classList.remove("btn-success");
		elt_ref.classList.remove("btn-warning");
		elt_ref.classList.add("btn-warning");
		elt_ref.title=message;

		icon_ref.classList.remove("fa-eye");
		icon_ref.classList.remove("fa-spinner");
		icon_ref.classList.remove("fa-pulse");
		icon_ref.classList.add("fa-eye");
	}	
}

//extract metadata,content from md file
function extractMetadataMdFile(data)
{
	var content = '';
	var reg_delim =/\s*---\s*/;
	var test_deb = reg_delim.exec(data);
	if (test_deb.length>0 && test_deb.index===0) 
	{
		content = data.slice(test_deb[0].length);
		var test_fin = reg_delim.exec(content);		
		content = (test_fin.length>0)? content.slice(0,test_fin.index) : '';
	}	
	return content;
}
function extractContentMdFile(data)
{
	var content = data;
	var reg_delim =/\s*---\s*/;
	var test_deb = reg_delim.exec(data);
	if (test_deb.length>0 && test_deb.index===0) 
	{
		content = data.slice(test_deb[0].length);
		var test_fin = reg_delim.exec(content);
		content = (test_fin.length>0)? content.slice(test_fin.index+test_fin[0].length) : data;
	}	
	return content;
}

// typeCommitMsg = ['modify_content','modify_meta','create','duplicate']
function commitMsgModifyCreateMd(_currentPath,typeCommit,extra_msg)
{
	
	var commit_path = _currentPath;
	var commit_root = '';

	var commit_msg = '';
	switch(typeCommit) {
		case 'modify_content':
			commit_msg = 'Modify content of ';
			break;
		case 'modify_meta':
			commit_msg = 'Modify settings of ';
			break;
		case 'create':
			commit_msg = 'Create ';
			break;
		case 'duplicate':
			commit_msg = 'Duplicate ';
			if (extra_msg !== undefined && extra_msg !== '') {
				commit_msg += extra_msg + ', '
			}
			break;

	}

	// var commit_msg = 'Create';
	// if (!isCreate) 
	// {
	// 	commit_msg = 'Modify content of ';
	// 	if (!isTypeContent) {
	// 		commit_msg = 'Modify settings of ';
	// 	}
	// }	

	TreeRootFilter.list.forEach(function(value) {
		if(_currentPath.indexOf(value.folderTree)===0)
		{
			commit_path = _currentPath.slice(value.folderTree.length+1);		
			commit_root	= value.titleOnTree;
		}
	});
	var index_section = commit_path.indexOf('/index.md');
	if (index_section > -1) 
	{
		commit_msg += 'section '+ commit_path.slice(0,index_section);		
	} 
	else
	{		
		commit_msg += 'item '+ commit_path;	
	}
	if (commit_root !== '') 
	{
		commit_msg +=', on root section : '+commit_root;
	}

	return commit_msg;
}

function commitMsgDeleteFile(_currentPath,isPathImg)
{
	var commit_msg = 'Remove ';
	var commit_path = _currentPath;
	var commit_root = '';	

	TreeRootFilter.list.forEach(function(value) {
		if(_currentPath.indexOf(value.folderTree)===0)
		{
			commit_path = _currentPath.slice(value.folderTree.length+1);		
			commit_root	= value.titleOnTree;
		}
	});

	if (isPathImg) 
	{
		// var image_name = _currentPath.slice(_currentPath.lastIndexOf('/')+1);
		//commit_msg = 'Image '+ image_name + ' has been removed , path : '+ _remove.slice(0,_remove.lastIndexOf('/'));
		commit_msg += 'image '+ commit_path;
	}
	else 
	{
		var index_section = commit_path.indexOf('/index.md');
		if (index_section > -1) 
		{
			commit_msg += 'section '+ commit_path.slice(0,index_section);	
		} 
		else
		{		
			commit_msg += 'item '+ commit_path;	
		}

	}
	if (commit_root !== '') 
	{
		commit_msg +=', on root section : '+commit_root;
	}
	return commit_msg;
		
}

function commitMsgUploadImage(_filename,_currentPath)
{
	var commit_msg = 'Upload image ';
	var commit_path = _currentPath;
	var commit_root = '';	

	TreeRootFilter.list.forEach(function(value) {
		if(_currentPath.indexOf(value.folderTree)===0)
		{
			commit_path = _currentPath.slice(value.folderTree.length+1);		
			commit_root	= value.titleOnTree;
		}
	});

	commit_msg += _filename + ' , path : ' + commit_path  ;
	if (commit_root !== '') 
	{
		commit_msg +=', on root section : '+commit_root;
	}
	return commit_msg;

}


//Extract git & front_matter_info from items on tree when opening a folder content, fn OpenSection()
// assign Current_git_items_tree, Current_raw_info_fm_items_tree, Current_nb_elt_folder_tree
function extract_info_from_tree(tree) {

	Current_git_items_tree=[];
	Current_raw_info_fm_items_tree=[];
	Current_nb_elt_folder_tree=[];
	Current_nb_elt_folder_tree_path=[];
	
	function one_fm_to_obj(_content) {

		var reg_delim_deb =/^\s*---\s*/;

		if (reg_delim_deb.test(_content)) 
		{
			var current_fm = extractMetadataMdFile(_content);
			//parse front matter
			var index_sep_meta;
			var key_meta;
			var value_meta;
			var objectFm={};

			var parseFm=current_fm.split('\n');					
			parseFm.forEach(function(metadata, index) {
				if (metadata.length>0) {
					index_sep_meta=metadata.indexOf(':'); //only first index
					key_meta=metadata.substring(0,index_sep_meta).replace(/^"/, "").replace(/"$/, "").trim();
					value_meta=metadata.substring(index_sep_meta+1).replace(/^"/, "").replace(/"$/, "").trim();
					objectFm[key_meta]=value_meta;
				}			
			});
			return objectFm;
		}
		return undefined;
	}

	return Promise.all(tree.map(function(item_tree){

		//collect info git for each item, collect in Current_git_items_tree
		var obj_fm_git={};
		obj_fm_git.sha=item_tree.sha;
		obj_fm_git.name=item_tree.name;
		obj_fm_git.path=item_tree.path;
		obj_fm_git.type=item_tree.type;
		obj_fm_git.downloadUrl=item_tree.downloadUrl;
		Current_git_items_tree.push(obj_fm_git);

		//extract raw front matter info from file type md, put in Current_raw_info_fm_items_tree, var global
		if (item_tree.type==='file' && item_tree.path.match('.md$')) {
			return octoRepo.git.blobs(item_tree.sha).read().then( function(content){
				Current_nb_elt_folder_tree.push(0);
				Current_nb_elt_folder_tree_path.push("");
				return one_fm_to_obj(content);						
			});
		}
		else if (item_tree.type==='dir') {
			return octoRepo.contents(encodeURI(item_tree.path)).fetch({ref:Git_refs_heads}).then( function(data) {
				var nb_files_on_section=data.length;
				var sync=0,
					_sha;
				data.forEach(function(items, index) {
					if(items.name === 'index.md') {
						_sha=items.sha;	
						nb_files_on_section--;
						Current_nb_elt_folder_tree_path.push(items.path);

					}
					sync+=1;					
				});
				Current_nb_elt_folder_tree.push(nb_files_on_section);
				//update nb_files_on_section
				if(sync >= data.length) {
					if (_sha !== undefined) {
						return octoRepo.git.blobs(_sha).read().then(function(content) {
							return one_fm_to_obj(content);
						});
					}
					else {
						return undefined;
					}					
				}
			});
		}
		else {
			Current_nb_elt_folder_tree.push(0);
			Current_nb_elt_folder_tree_path.push("");
			return undefined;
		}
	})).then(function(contents){
		Current_raw_info_fm_items_tree=contents;
		return ;		
	});	
}

function activeBtnEnteteDir (list_folders, _current_path) {
	var flag_show_btn=false;
	list_folders.forEach(function(path_to_create) {		
		var update_output = filter_current_path_with_model(_current_path, path_to_create);
		if (update_output) {
			flag_show_btn = true;
		}
	});
	return flag_show_btn;
}




$('body').on('click', '#ShowListAction', function(){
	
	var content_btn = "<i class='fa fa-eye-slash fa-fw fa-lg'></i>Hide Menu";

	var elt_ref_class=  document.getElementById('ListActionsAside').classList;
	if (elt_ref_class.value.indexOf('u-hidden') > -1)
	{
		elt_ref_class.remove("u-hidden");		
	}
	else
	{
		content_btn = "<i class='fa fa-eye fa-fw fa-lg'></i>Show Menu";
		elt_ref_class.add("u-hidden");
	}
	$('#ShowListAction .btn').html(content_btn);

});

function initBtnShowListAction()
{
	var content_btn = "<i class='fa fa-eye-slash fa-fw fa-lg'></i>Hide Menu";
	$('#ShowListAction').html(				
		"<button type='button' class='btn btn-success btn-sm'>"+content_btn+"</button>"
	);
}

function hideBtnId(id_btn)
{
	var elt_ref_class = document.getElementById(id_btn).classList;
	if (elt_ref_class.value.indexOf('u-hidden') === -1)
	{
		elt_ref_class.add("u-hidden");		
	}	
}

function showBtnId(id_btn)
{
	var elt_ref_class = document.getElementById(id_btn).classList;
	if (elt_ref_class.value.indexOf('u-hidden') > -1)
	{
		elt_ref_class.remove("u-hidden");		
	}
}

function hideBtn$(elt_ref) 
{
	var elt_btn = $(elt_ref)
	if ( !elt_btn.hasClass('u-hidden'))
		elt_btn.addClass('u-hidden');
}
function showBtn$(elt_ref) 
{
	var elt_btn = $(elt_ref)
	if ( elt_btn.hasClass('u-hidden'))
		elt_btn.removeClass('u-hidden');
}

 

// Show folder contents, filter file index.md 
function OpenSection(_currentName, _currentPath){

	CurrentName = _currentName;
	CurrentPath = _currentPath;
	$('.loading, .noclick').toggle();
	$('body').attr('data-content', 'dir');	
	
	$('main .content, main .images').empty();


	//test current path : active or not button .create-item / section
	var show_btn_create_item=!activeBtnEnteteDir(PathsFmModifyOnlyItem,CurrentPath);
	var block_del_duplic_item=false;
	if (show_btn_create_item) {
		activeBtnCreate(PathsFmCreateItem, CurrentPath, 'create-item-id');
	}
	else {
		block_del_duplic_item=true;
	}
	activeBtnCreate(PathsFmCreateButtonSection, CurrentPath, 'create-section-id');
	activeBtnUpdate('update-site-id');
	activeBtnUploadImage('upload-image-id');
	hideBtnFileUptodate();
	showBtnId('ShowListAction');
	showBtn$('.main-nav .adminMode');

	//test current path: can access metadata of dir 
	var show_metadata_dir=activeBtnEnteteDir(PathsFmCreateModifySection,CurrentPath);
	//test current path section, can delete section if empty
	var show_delete_section=activeBtnEnteteDir(PathsFmCanDeleteSection,CurrentPath);
	
	//test info section parent 
	var filter_md_no_editor=false;
	if (index_current_raw_section_ref > -1) 
	{
		if (Current_raw_info_fm_section_ref!==undefined) {
			if (Current_raw_info_fm_section_ref["type_child_editor"] !== undefined) {
				if (Current_raw_info_fm_section_ref["type_child_editor"] === 'NoEditor') {
					filter_md_no_editor=true;
				}
			}
		}
	}

	//sortable - re-init current items list, type sort section ref
	sortableOnOpenSection_init_loop();
	//tableflex
	tableFlexOnOpenSection_init_loop();

	var isPathImg = (CurrentPath.indexOf('/')==-1) ? CurrentPath.indexOf(PathImageRef)===0 : CurrentPath.indexOf(PathImageRef+'/')===0;

	var isAdminDir = false;
	TreeRootFilter.list.forEach(function(value) {
		if(CurrentPath.indexOf(value.folderTree)>-1)
		{
			if (value.filter_mode_admin===true) 
				{isAdminDir=true;}
		}
	});

	var isSectionWithFileAction2add = returnValue_extractPathsModelFm_KeyValue(PathsFmSectionsWithFileActions, CurrentPath);

	var _modeTextContentSection = activeBtnEnteteDir(PathsFmTextContentSection,CurrentPath);
	// _modeTextContentSection=false;
	

	ContentOcto(CurrentPath, Git_refs_heads, function(err,data_tree) {
		if(err===null){
			extract_info_from_tree(data_tree).then(function(){
				Current_git_items_tree.forEach(function(value, index,array) {
					if(!value.path.match('.ds_store$')){
						//------------------
						// image
						if(value.path.match('.jpg$') || value.path.match('.png$') || value.path.match('.JPG$') || value.path.match('.PNG$') || 
							 value.path.match('.gif$') || value.path.match('.GIF$') || value.path.match('.svg$') || value.path.match('.SVG$'))
						{
							$('main .images').append(
								"<div class='card ' data-name='" + value.name + "' data-path='" + value.path + "'>"+
									"<div class='view overlay hm-white-slight'>"+
										"<img src='" + value.downloadUrl + "' class='img-fluid'>"+            			
					        "</div>"+
					        "<div class='card-block'>"+
						        "<h4 class='card-title'>"+value.name+"</h4>"+						        
						        "<div class='actions'>"+											
											"<a href='"+value.downloadUrl+"' target='_blank'><span class='watchRaw' title='Link to raw image'> <i class='fa fa-fw fa-lg fa-expand' aria-hidden='true'></i></span></a>"+
											"<span class='delete' data-path='" + value.path + "' title='Delete the image'><i class='fa fa-fw fa-lg fa-trash-o' aria-hidden='true'></i></span>"+
										"</div>"+
					    		"</div>"+
								"</div>");
							
						}
						//------------------
						// items : dir , files
						else if (value.name !== 'index.md' || (_modeTextContentSection && value.name === 'index.md'))
						{							

							var display_title=value.name;
							var noContentEditor=false;
							var attr_editor='md';

							var _modeAdminFilter = activeBtnEnteteDir(PathsFmAdminHideMetaSection,value.path);
							var adminContent = (site_mode_admin_gl==true && _modeAdminFilter == true ) ? true : false;
							adminContent = (isAdminDir) ? true : adminContent;

							// var _modeTextContentSection = activeBtnEnteteDir(PathsFmTextContentSection,value.path);
							// _modeTextContentSection=false;

							var _modeAddFileActions2Section = false;
							
							
							if (Current_raw_info_fm_items_tree[index]!==undefined) {
								
								//display title
								if ((_modeTextContentSection && value.name === 'index.md')) 
								{
									display_title = 'Page content';

								} else {
									if (hasContentsString(Current_raw_info_fm_items_tree[index].title)) {
										display_title=Current_raw_info_fm_items_tree[index].title;
									}
								}
								

								// case section, nocontent editor type
								if (hasContentsString(Current_raw_info_fm_items_tree[index].type_child_editor)) {		
									if (Current_raw_info_fm_items_tree[index].type_child_editor === 'NoContent') { //todo to avoid
										noContentEditor = true;
									}	
								}

								if (isSectionWithFileAction2add !== undefined) 
								{
									if (hasContentsString(Current_raw_info_fm_items_tree[index].template_page)) {
										var templ=Current_raw_info_fm_items_tree[index].template_page;
										if (templ.indexOf(isSectionWithFileAction2add)===0) {
											_modeAddFileActions2Section=true;
										}
									}

								}

								//sortable - save info to sort section/items 
								sortableOnOpenSection_on_loop(Current_raw_info_fm_items_tree,index);
							}

							//
							

							// display icon card-footer
							var display_icon_footer = '<i class="fa"></i>';

							var data_path_footer = 'data-path="'+value.path+'"';
							var data_type_footer = 'data-type="'+value.type+'" ';
							var data_index_footer = ' data-index="'+index+'"';

							//--------------------------------------
							//display entete to access metadata form
							
							var config_fa = ' fa-fw fa-lg';
							var class_admin = (adminContent)?"admin":"";

							var display_metadata = 
								'<span class="metadata '+ class_admin +'" title="Settings - metadata" data-path="'+value.path+'"'+data_index_footer+'>'+
									'<i class="fa fa-cog '+config_fa+'" aria-hidden="true"></i>'+'</span>';
						
							// delete specific item, rewrite after if dir ! 
							var display_delete = 
								'<span class="delete" title="Delete item" data-path="'+value.path+'">'+
									'<i class="fa fa-trash-o '+config_fa+'" aria-hidden="true"></i></span>';
							// duplicate specific item
							var display_duplicate = 
								'<span class="duplicate" title="Duplicate item" data-path="'+value.path+'">'+
									'<i class="fa fa-files-o '+config_fa+'" aria-hidden="true"></i></span>';

							
							//----------------------------------------------------
							if (value.type === 'dir' || value.type === 'tree') {

								if (value.path.indexOf(PathImageRef+'/')==0) {
									display_metadata='';
									display_delete='';
								}
								else
								{
									if (_modeAddFileActions2Section) 
									{
										display_delete = 
											'<span class="delete" title="Delete item" data-path="'+value.path+'/index.md'+'">'+
												'<i class="fa fa-trash-o '+config_fa+'" aria-hidden="true"></i></span>';

									} else {

										Current_nb_elt_folder_tree_path.forEach(function(path, index_path) {
											if(path.indexOf(value.path)>-1)
											{
												if (Current_nb_elt_folder_tree[index_path]>0) {
													display_delete='';
												}
												else {
													// display_delete = '<span class="delete" data-path="'+value.path+'/index.md'+'">delete empty</span>';
													display_delete = 
														'<span class="delete" title="Delete item" data-path="'+value.path+'/index.md'+'">'+
															'<i class="fa fa-trash-o '+config_fa+'" aria-hidden="true"></i></span>';
												}
											}
										});
										if (!show_delete_section) {
											var show_delete_subsection=activeBtnEnteteDir(PathsFmCanDeleteSection,value.path);
											if (!show_delete_subsection) {	
												display_delete='';
											}
										}
									}

									if (!show_metadata_dir) {										
										var show_metadata_subdir=activeBtnEnteteDir(PathsFmCreateModifySection,value.path);
										if (!show_metadata_subdir) {	
											display_metadata='';
										}
									}

									if (!site_mode_admin_gl)
									{
										var hide_metadata_subdir=activeBtnEnteteDir(PathsFmAdminHideMetaSection,value.path);
										if (_modeAdminFilter) {	
											display_metadata='';
										}
									}
									
								}
								//default, section cant be duplicate
								display_duplicate='';

								//specific section with no content files but on index.md desciption section
								// if (_modeTextContentSection) 
								if ((_modeTextContentSection && value.name === 'index.md')) 
								{

								}
								else {
									//cas type_child_editor = "NoContent"
									if (noContentEditor) {									
										display_icon_footer='';
										data_path_footer='';
										data_type_footer='';										
									}
								}														

							}
							//----------------------------------------------------
							else {
								//++++++++++++++++
								//cas file .md
								//+++++++++++++++++

								if ((_modeTextContentSection && value.name === 'index.md'))
								{
									// !! don't move
									display_metadata='';
									display_delete='';
									display_duplicate='';
								}
								else
								{
									if (block_del_duplic_item) {
										display_delete='';
										display_duplicate='';
									}
									
									//cas type_child_editor = "NoEditor"
									if (filter_md_no_editor) {									
										display_icon_footer='';
										data_path_footer='';
										data_type_footer='';								
									}
								}

							}

							//add editor defined on createItem step
							if (Current_raw_info_fm_items_tree[index]!==undefined) {								
								if (hasContentsString(Current_raw_info_fm_items_tree[index].type_editor)) {		
									if (Current_raw_info_fm_items_tree[index].type_editor === 'CkEditor(Word)') { //todo to avoid
										attr_editor='html';
									}	
								}
							}
					


							//----------------------------------------------------
							//common dir and file
							//----------------------------------------------------
							var addItemOnTable = true;
							// Sortable, add html ref
							var sortable_class = SortableConfigRef.config.class_ref_item;
							var sortable_id = SortableConfigRef.config.id_index_ref_item+'="'+index+'"';
							
							// update items table flex
							var class_heading = sortable_class+'" ' + sortable_id +' data-icon="' + value.type;
							var display_action =  display_metadata+display_delete+display_duplicate;

							var type_item_row = value.type;
							if ((data_type_footer === '') && (value.type=== 'dir' || value.type=== 'tree')) {
								type_item_row = 'empty_dir';
							}
							if ((data_type_footer === '') && (value.type=== 'file')) {
								type_item_row = 'empty_file';
							}
							if (type_item_row==='dir'&&isAdminDir) 
								{type_item_row='admin_dir'}
							if (type_item_row==='file'&&isAdminDir) 
								{type_item_row='admin_file'}

							if ((_modeTextContentSection && value.name === 'index.md'))
							{
								type_item_row+='_textcontent';
								// var data_path_footer = 'data-path="'+value.path+'/index.md'+'"';
								// var data_path_footer = 'data-path="'+value.path+'"';
								// data_type_footer = 'data-type="'+'file'+'" ';
							}

							var data_list =	'';
							data_list = data_list +
								data_type_footer + data_path_footer + data_index_footer +
								' data-name="'+value.name +'" '+' data-editor="'+attr_editor+
								'" data-title="'+encodeURI(display_title)+'"';


							//extra filtering
							if (isPathImg && value.name === file_new_folder_img_gl) 
							{ 
								addItemOnTable = false;
							}


							if (addItemOnTable) 
							{
								tableFlexOnOpenSection_on_loop(type_item_row,class_heading,display_title,display_action,data_list);
							}

						}

						//------------------
						// info section ref
						if (value.name === 'index.md'){

							index_current_raw_item_ref=index;

							//info sortable
							sortableOnOpenSection_get_section_ref(Current_raw_info_fm_items_tree,index);
						
						}


						//-------------
						// last index
						//-------------
						if (index === (array.length-1) )
						{
							//--------------
							// Table flex
							//--------------
							var filter_sortable_fields = false;							
							if (isPathImg)							
							{
								filter_sortable_fields=true;
							}
							tableFlexOnOpenSection('main .content',filter_sortable_fields,Default_lang);

							//filter image path
							if (!isPathImg)
							{								
								//------------
								// SORTABLE
								//------------
								var breadcrumb = $('.breadcrumb span:last-child span').attr( 'data-path').replace(/\//g,'-');
								sortableOnOpenSection(breadcrumb);	
														
							}							
						}// end last index

					}

				});// end loop extract each item
			});			


		}else{//in this case go to the preceding folder
			$('.breadcrumb span:last-child span').trigger('click');
		}

		
		// ! pass before end loop extract each item
		// short effect, can be discuss
		$('.loading, .noclick').toggle();
	});
}




//Call the function
$('body').on('click', '[data-type="tree"], [data-type="dir"], [data-type="breadcrumb"]', function(){
	
	var display_name=$(this).attr('data-name');
	var display_path=$(this).attr('data-path');
	var display_path_img_tree=$(this).attr('data-path-img-tree');
	var data_index_section=$(this).attr('data-index');
	var data_type_section=$(this).attr('data-type');

	var display_title=CurrentName;
	var display_breadcrumb=true;
	var redir=true;
	
	//--------------------
	// gestion path image
	// see fn fmUpdatedFromEditor tag:image
	//--------------------
	update_CurrentPathImage(display_path,display_path_img_tree);


	var update_info_section = true;
	if (data_type_section === 'breadcrumb') 
	{
		if ($(this).html() === Current_raw_info_fm_section_ref['title'])
		{
			update_info_section = false;
		}
	}

	if (update_info_section) 
	{
		index_current_raw_section_ref=-1;
		Current_raw_info_fm_section_ref={};
		if (data_index_section !== undefined) {
			
			index_current_raw_section_ref=parseInt(data_index_section,10);
			Current_raw_info_fm_section_ref= $.extend(true, {}, Current_raw_info_fm_items_tree[index_current_raw_section_ref]);
			
		}
	}
	

	if( $(this).is('li') === true){
		$('.breadcrumb .show-root').nextAll().remove();		
		display_title=decodeURI($(this).attr('data-title'));
	}else if($(this).attr('data-type') === "breadcrumb"){
		display_breadcrumb=false;
		if (display_path !== CurrentPath) {
			$(this).parent('.folder').nextAll().remove();
			display_title=$(this).html();
		}
		else {			
			redir=false;
		}
		
	}else{//if click in a dir
		if ($(this).attr('data-title') !== undefined) {
			display_title = decodeURI ($(this).attr('data-title'));
		}		
	}

	if (display_breadcrumb) {
		$('.breadcrumb').append(
		'<span class="folder">'+
			'<i class="fa fa-angle-double-right"></i> '+
			'<span data-type="breadcrumb" data-path="'+$(this).attr('data-path') +
					'" data-name="'+$(this).attr('data-name')+'"'+
					'" data-index="'+$(this).attr('data-index')+'"'+'>'+display_title+'</span>'+
		'</span>');
	}
	if (redir) {
		OpenSection(display_name, display_path);
	}	
	
});


function update_CurrentPathImage(display_path,display_path_img_tree){
	// mode image : [baseurl, picture_originals, direct_url]
	// picture_originals, nedd to adapat folder !
	// see fn fmUpdatedFromEditor tag:image
	//--------------------
	var display_path_tree = display_path.indexOf('/');
	var isPathImg = (display_path_tree === -1) ? display_path.indexOf(PathImageRef)===0 : display_path.indexOf(PathImageRef+'/')===0;

	if (display_path_img_tree !== undefined ) {
		//info from root, adapted with DefaultModeImage selected
		CurrentPathImage=display_path_img_tree;
		adaptCustomPathImg_gl = '';
		if (DefaultModeImage === 'picture_originals' && !isPathImg) 
			CurrentPathImage = PathImagePictOriginals+'/'+display_path_img_tree;		
	}
	else 
	{		
		if (isPathImg)
		{
			CurrentPathImage='';
			if (display_path_tree > -1 )
			{
				var update_path = true;
				//filter PathImagePictOriginals
				if (display_path.endsWith(PathImagePictOriginals))
					update_path=false;				
				if (update_path) 
					CurrentPathImage=display_path.slice(display_path_tree+1);							
			}
		}
		//else do nothing
	}
	if (!isPathImg) 
	{
		//adaptation if section with customModeImage meta
		var customModeImg=returnValue_extractPathsModelFm_KeyValue(PathsFmCustomImgItem, display_path);
		if (customModeImg !== undefined)
		{
			activeCustomModeImg_gl = true;
			if (customModeImg !== 'picture_originals') 
			{
				//filter PathImagePictOriginals
				if (CurrentPathImage.indexOf(PathImagePictOriginals+'/') > -1) 
					CurrentPathImage = CurrentPathImage.slice(PathImagePictOriginals.length+1);				
			}
		}
		else
		{
			activeCustomModeImg_gl = false;
			if (DefaultModeImage === 'picture_originals') 
			{
				if (CurrentPathImage.indexOf(PathImagePictOriginals+'/') === -1) 
					CurrentPathImage = PathImagePictOriginals+'/'+ CurrentPathImage;				
			}
		}

		// PathsFmAddPathImgSection
		var adaptPathImg_section = activeBtnEnteteDir(PathsFmAddPathImgSection,display_path);

		if (adaptPathImg_section)
		{
			if (adaptCustomPathImg_gl.length > 0) 
				CurrentPathImage = CurrentPathImage.replace('/'+adaptCustomPathImg_gl,'');

			adaptCustomPathImg_gl = display_path.slice(display_path.lastIndexOf('/')+1);
			CurrentPathImage = CurrentPathImage + '/' + adaptCustomPathImg_gl;


		}
		else
		{
			if (adaptCustomPathImg_gl.length > 0) 
				CurrentPathImage = CurrentPathImage.replace('/'+adaptCustomPathImg_gl,'');

			adaptCustomPathImg_gl = '';
		}


	
	} // end test (!isPathImg) 

}

//subfunction active or not button UploadImage
function activeBtnUploadImage ( id_btn) {
	var flag_desactive_btn=true;

	if (CurrentPathImage !== '' ) 
	{
		flag_desactive_btn=false;
		var adaptPathImg_section=[];	
		var adaptPathImg_subsection=[];
		var isPathImg = (CurrentPath.indexOf('/') === -1) ? CurrentPath.indexOf(PathImageRef)===0 : CurrentPath.indexOf(PathImageRef+'/')===0;		
		if (!isPathImg) 
		{			
			//path is in list PathsFmAddPathImgSection
			var testPathSection = CurrentPath+'/'+'$xxx';					
			adaptPathImg_section = returnArrayPath_extractPathsModelFm(PathsFmAddPathImgSection,testPathSection);
			// test case subsection generic				
			if (CurrentPath.indexOf('/') > -1) 
			{
				var _CurrentPathSubsection = CurrentPath.slice(0,CurrentPath.lastIndexOf('/'));
				var testPathSubsection = _CurrentPathSubsection+'/'+'$xxx'+'/'+'$xxx';
				adaptPathImg_subsection = returnArrayPath_extractPathsModelFm(PathsFmAddPathImgSection,testPathSubsection);
			}	
		}
		else
		{			
			//filtering original parts PathImagePictOriginals
			var _pathImg = CurrentPathImage;
			if (_pathImg.indexOf(PathImagePictOriginals+'/') > -1) 
					_pathImg = _pathImg.slice(PathImagePictOriginals.length+1);	
			
			//path is in list PathsFmAddPathImgSection
			var testPathSection = _pathImg+'/'+'$xxx';	
			PathsFmAddPathImgSection.forEach(function(path, index) 
			{
				if (path.indexOf(testPathSection) > -1) 
					adaptPathImg_section.push(path);
			});
			//test case subsection generic
			if (_pathImg.indexOf('/') > -1) 
			{
				var _pathImgSubsection = _pathImg.slice(0,_pathImg.lastIndexOf('/'));
				var testPathSubsection = _pathImgSubsection+'/'+'$xxx'+'/'+'$xxx';
				PathsFmAddPathImgSection.forEach(function(path, index) 
				{
					if (path.indexOf(testPathSubsection) > -1) 
						adaptPathImg_subsection.push(path);
				});
			}				
		}

		if (adaptPathImg_section.length > 0 || adaptPathImg_subsection.length > 0) 
		{
			flag_desactive_btn=true;
		}
		
	}
		
	
	if (flag_desactive_btn===true) {
		document.getElementById(id_btn).classList.add("u-hidden");
	}
	else {
		document.getElementById(id_btn).classList.remove("u-hidden");	
	}
}




//Show file / items contents
function Edit(_currentName, _currentPath, _editor){
	CurrentName = _currentName;
	CurrentPath = _currentPath;
	$('.loading, .noclick').toggle();
	$('body').attr('data-content', 'file');
	// $('#FTitle').text(CurrentName);
	$('main .content, main .images').empty();	

	ReadBlob(CurrentPath, Git_refs_heads, function(data) {
		if (data !== undefined)
		{
			//extract info file md
			FrontMatter = extractMetadataMdFile(data);
			var _content = extractContentMdFile(data);			
						
			if(_editor === 'md')
			{
				mdEditor(_content, FrontMatter);
			}else
			{
				//CKeditor
				ckEditor(_content,FrontMatter, 'main .content');
			}
		}
		else 
		{
			//redirection to current folder
			var redir_path = CurrentPath.replace('/'+CurrentName,'');
			var redir_name;
			var cut = redir_path.lastIndexOf('/');
			if (cut === -1) {
				redir_name = redir_path;
			}
			else {
				redir_name = redir_path.substring(cut + 1);
			}		
			OpenSection(redir_name, redir_path);
		}
		$('.loading, .noclick').toggle();
	});

}

//Call the function
$('body').on('click', '[data-type="blob"], [data-type="file"]', function(e){

	sortableFormInvisible();


	//extract update_value_sortable, used in saveChanges
	update_value_sortable_saveChanges = sortableExtractCurrentUpdateValue($(this).attr('data-index'));

	
	if ($(this).attr('data-editor')!==undefined) {
		
	 	var display_name=$(this).attr('data-name');
		var display_path=$(this).attr('data-path');
	 	var display_title=CurrentName;
	 	if ($(this).attr('data-title') !== undefined) {
	 		display_title=decodeURI($(this).attr('data-title'));
	 	}
		$('.breadcrumb').append(
			'<span class="folder">'+
				'<i class="fa fa-angle-double-right"></i>'+
				'<span data-type="breadcrumb" data-path="' + display_path + '" data-name="' + display_name + 
					'" data-index="' + $(this).attr('data-index') + '" >' + display_title + '</span>'+
			'</span>');

		if(display_path.match('.md$') || display_path.match('.markdown$')){			

			Edit($(this).attr('data-name'), $(this).attr('data-path'), $(this).attr('data-editor'));			
		}		
		else{
			Edit($(this).attr('data-name'), $(this).attr('data-path'), 'html');
		}
	}
	else 
	{
		CurrentName = $(this).attr('data-name');
		CurrentPath = $(this).attr('data-path');
		$('#Editors').modal('toggle');
	}
});

$('#Editors .modal-footer .btn').click(function(e){
	
	Edit(CurrentName, CurrentPath, $(this).attr('data-editor'));
});


//Ckeditor
function ckEditor(_data,_fm, _location){
	$(_location).html( 
		'<form>'+
			'<textarea name="editor1" id="editor1" rows="10" cols="80">'+
				_data+
			'</textarea>'+
		'</form>');

	//see create destroying editor http://sdk.ckeditor.com/samples/saveajax.html#
	var editor1=CKEDITOR.replace( 'editor1', {
	    language: 'fr',
	    uiColor: '#9AB8F3' //'#16ab9a'
	});

	editor1.on( 'change', function ( ev ) {
		if(_data === editor1.getData())
		{
			initBtnUptodate_uptodate();	
		}else
		{
			initBtnUptodate_save();	
		}						
	} );
	
	//init user interface
	initBtnUptodate();
	hideBtnId('ShowListAction');
	hideBtn$('.main-nav .adminMode');
	//pb with .one, fires multiples times
	$('.contentUpToDate .btn').unbind().click(function(e){	
		saveChanges(_fm,editor1.getData());				
	});	

}


//Markdown editor
function mdEditor(_data, _fm)
{
	$('main .content').html(		
		'<div class="tab-content">'+
			'<div role="tabpanel" class="tab-pane active" id="editMdContent">'+
				'<textarea class="form-control" id="mdEditor"></textarea>'+
			'</div>'+
		'</div>'+
		'<div id="saveInMd" class="hidden"></div>');

	//init user interface
	initBtnUptodate();
	hideBtnId('ShowListAction');
	hideBtn$('.main-nav .adminMode');

	var simplemde = new SimpleMDE({
		element: document.getElementById("mdEditor"),
		spellChecker: false,
		tabSize: 4,
		toolbar: ["bold", "italic", "strikethrough",
					"|",
					"heading", "heading-smaller", "heading-bigger",
					"|",
					"code", "quote", "unordered-list", "ordered-list", "horizontal-rule",
					"|",
					"link",
					{
			            name: "image",
			            className: "search-image fa fa-picture-o",
			            action: searchImage,
			            title: "Insert Image",
					},
        	{
	            name: "image2",
	            className: "insert-image fa fa-times",
	            action: _drawImage,
	            title: "Insert Image",
        	},
					"|" ,
					"side-by-side",
					{
			            name: "expand",
			            action: mdexpand,
			            className: "expand fa fa-arrows-alt",
			            title: "Toggle Fullscreen",
	    			},
	    			"fullscreen", "preview"
        		]
	});

	function _drawImage(editor) {
		var cm = editor.codemirror;
		var stat = _getState(cm);
		_replaceselection(cm, stat.image, '\n' + InsertImage + '\n' , "");
		InsertImage = "";
	}
	SimpleMDE._drawImage = _drawImage;
	SimpleMDE.prototype._drawImage = function() {
		_drawImage(this);
	};
	function _getState(cm, pos) {
		pos = pos || cm.getCursor("start");
		var stat = cm.getTokenAt(pos);
		if(!stat.type) return {};

		var types = stat.type.split(" ");

		var ret = {},
			data, text;
		for(var i = 0; i < types.length; i++) {
			data = types[i];
			if(data === "strong") {
				ret.bold = true;
			} else if(data === "variable-2") {
				text = cm.getLine(pos.line);
				if(/^\s*\d+\.\s/.test(text)) {
					ret["ordered-list"] = true;
				} else {
					ret["unordered-list"] = true;
				}
			} else if(data === "atom") {
				ret.quote = true;
			} else if(data === "em") {
				ret.italic = true;
			} else if(data === "quote") {
				ret.quote = true;
			} else if(data === "strikethrough") {
				ret.strikethrough = true;
			} else if(data === "comment") {
				ret.code = true;
			}
		}
		return ret;
	}
	function _replaceselection(cm, active, start, end) {
		if(/editor-preview-active/.test(cm.getWrapperElement().lastChild.className))
			return;

		var text;
		var startPoint = cm.getCursor("start");
		var endPoint = cm.getCursor("end");
		if(active) {
			text = cm.getLine(startPoint.line);
			start = text.slice(0, startPoint.ch);
			end = text.slice(startPoint.ch);
			cm.replaceRange(start + end, {
				line: startPoint.line,
				ch: 0
			});
		} else {
			text = cm.getSelection();
			cm.replaceSelection(start + text + end);

			startPoint.ch += start.length;
			if(startPoint !== endPoint) {
				endPoint.ch += start.length;
			}
		}
		cm.setSelection(startPoint, endPoint);
		cm.focus();	
	}

	simplemde.value(_data);

	$('.editor-toolbar .fa-columns').trigger( 'click' );
	$('.fa-arrows-alt:not(.expand)').hide();
	$('main .content').wrapInner('<div id="md-editor" class="nofull" />');


	simplemde.codemirror.on("change", function(){
		if(_data === simplemde.value())
		{
			initBtnUptodate_uptodate();			
		}else
		{
			initBtnUptodate_save();		
		}
	});

	$('.contentUpToDate .btn').unbind().click(function(e){	
		$('#saveInMd').trigger('click');
	});	

	$('#saveInMd').unbind().click(function(e){
		saveChanges(_fm, simplemde.value());
	});
}

// Gestion btn uptodate
function initBtnUptodate()
{
	$('aside .contentUpToDate').removeClass('u-hidden');
	$('.contentUpToDate .btn').html('<i class="fa fa-check"></i> Up to date');
	$('.contentUpToDate .btn').removeClass('btn-warning');
	$('.contentUpToDate .btn').addClass('btn-success');
}
function hideBtnFileUptodate () 
{
	var elt_btn = $('aside .contentUpToDate')
	if ( !elt_btn.hasClass('u-hidden'))
		elt_btn.addClass('u-hidden');
}
function initBtnUptodate_uptodate()
{
	$('.contentUpToDate .btn').removeClass('btn-warning');
	$('.contentUpToDate .btn').addClass('btn-success');
	$('.contentUpToDate .btn').html('<i class="fa fa-check"></i> Up to date').prop('disabled', true);
}
function initBtnUptodate_save()
{
	$('.contentUpToDate .btn').removeClass('btn-success');
	$('.contentUpToDate .btn').addClass('btn-warning');
	$('.contentUpToDate .btn').html('<i class="fa fa-save"></i> Save change').prop('disabled', false);
}
function spinnerBtnUptodate()
{
	$('.contentUpToDate .btn').html(
		'<div class="spinner-uptodate"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>').prop('disabled', true);
}

//Editor full screen
function mdexpand(){
	$('.expand').toggleClass('isactive');
	$('#md-editor').toggleClass('nofull');
	$('.editor-toolbar .actions').toggle();
}

//Open the FromUrl image form
function searchImage(){

	$('#FromUrl').trigger('click');
}

//Image manager
function MdImage_select(_path){	

	var type_btn='select_mdimage';
	var text_btn='Select';

	$('#MdImage .images').empty();
	$('#MdImage .loading, .noclick').toggle();
	if($('#MdImage .uploader').css("display") !== 'none'){
		//display select image on list by default
		$('#MdImage .images, #MdImage .uploader').toggle();
	}
	
	if(_path)
	{
		ContentOcto(_path, Git_refs_heads, function(err,data) {
			if(data !== 404){
			//if the function retrieves contents (when deleting files if the folder is left empty the folder is deleted too so the function returns error)
				data.forEach(function(value, index) 
				{
					if(!value.path.match('.DS_Store$'))
					{
						if(value.path.match('.jpg$') || value.path.match('.png$') || value.path.match('.JPG$') || value.path.match('.PNG$') || 
							value.path.match('.gif$') || value.path.match('.GIF$') || value.path.match('.svg$') || value.path.match('.SVG$'))
						{
							$('#MdImage .images').append(								
								"<div class='card'>"+
									"<div class='view overlay hm-white-slight'>"+
										"<img src='" + value.downloadUrl + "' class='img-fluid'>"+			
					        "</div>"+
					        "<div class='card-block'>"+
					        	"<p class='card-title'>" + value.name + "</p>"+
							      "<div data-name='"+value.name+"' data-url='"+value.downloadUrl+"' class='"+type_btn+" btn btn-success btn-block'>"+
												"<i class='fa fa-check'></i>"+text_btn+
										"</div>"+
					    		"</div>"+
								"</div>");
						}					
					}
				});
			}
			else
			{
				//in this case go to the preceding folder
				$('.breadcrumb span:last-child span').trigger('click');
			}

			initBackSelectMenu();

			$('#MdImage .loading, .noclick').toggle();
		});
	}

}


// SPECIFIC FM EDITOR
//Select image on fm metadata editor : select_mdimage btn action
// ref caller : CallerMdImageModal 
$('body').on('click', '#MdImage .card .card-block > .select_mdimage', function(){	

	updateImageFmEditor($(this).attr('data-name'),CallerMdImageModal,KeyMdImageModal,false,function() {

		var btn$='#'+CallerMdImageModal+' .modal-footer button';
		$(btn$).prop('disabled', false);

		$('#MdImage').modal('toggle');
		$('#'+CallerMdImageModal).modal('toggle');
	});	
});

//back to fm metadata editor
// $('body').on('click', '#MdImage .actionsMdImage .back-fm-editor ', function(){	
$('body').on('click', '#MdImage .back-fm-editor button', function(){	
	$('#MdImage').modal('toggle');
	$('#'+CallerMdImageModal).modal('toggle');		
});


//Top bar image manager, select on list
//upload
$('body').on('click', '#Upload', function(){

	$('#MdImage .images, #MdImage .uploader').toggle();
	//adapt toogle vutton content
	var content_btn = "<i class='fa fa-plus-circle fa-fw fa-lg'></i>Upload new image";
	if ($('#MdImage .back-select-menu i').hasClass('fa-plus-circle'))
	{		
		content_btn = "<i class='fa fa-angle-double-left fa-fw fa-lg'></i>Back Select image";
	}
	$('#MdImage .back-select-menu .btn').html(content_btn);
});

function initBackSelectMenu()
{
	var content_btn = "<i class='fa fa-plus-circle fa-fw fa-lg'></i>Upload new image";
	$('#MdImage .back-select-menu').html(				
		"<button id='Upload' type='button' class='btn btn-success'>"+content_btn+"</button>"
	);
}

//Remove image from upload queue
$('body').on('click', '.dz-remove', function(){
	$(this).closest('.dz-preview').remove();
});
//Close the dropbox
$('body').on('click', '.uploader .btn-danger', function(){
	$('#MdImage .uploader, #MdImage .images').toggle();
	$('form.dropzone .dz-preview').remove();
	$('form.dropzone').removeClass('dz-started');
});
//Upload the images
$('body').on('click', '#MdImage .uploader .btn-success', function(){
	
	var _path = PathImageRef;
	if (CurrentPathImage!=='') {
		_path+='/'+CurrentPathImage;
	}
	
	_imagesToUpload = ($('#MdImage .manager-drop img').length); //# of images to upload
	_augmentIn = 100 / _imagesToUpload;
	_imagesUploaded = 0;
	if (_imagesToUpload === 0) {
	  alert('There are no images to upload');
	}else {
		$('#MdImage .uploading, .noclick').toggle();
		UploadDropImages(_path, '#MdImage .manager-drop img', '#MdImage .uploading',_augmentIn, function() {
			UpdateLocalRepo();	
			MdImage_select(_path);
			$('#MdImage .uploader, #MdImage .images').toggle();
			$('#MdImage form.manager-drop .dz-preview').remove();
			$('#MdImage form.manager-drop').removeClass('dz-started');
			$('#MdImage .uploading .progress').attr('value', '0');
			$('#MdImage .uploading .percent').text('0');
			$('#MdImage .uploading, .noclick').toggle();
			$('#Upload').trigger('click');
		});		
	}
});

//++++++++++++++++++++++++++++++++++++++++
//Insert from url in simple mde editor
//++++++++++++++++++++++++++++++++++++++++

$('#FromUrl').click(function(){
	$('#insertUrl').modal('toggle');
});
$('body').on('input', '#insertUrl input', function(){
	_imageUrl = encodeURI($(this).val());

	//add filter googledrive url
	if (_imageUrl.indexOf('https://drive.google.com/open?id=')>-1) {
		_imageUrl='https://drive.google.com/uc?export=view&id='+_imageUrl.replace('https://drive.google.com/open?id=','');
	}
	$(this).parent().next().children().attr('src', _imageUrl);	

});

$('body').on('click', '#insertUrl .modal-footer .btn', function(){
	var _image_url = $('#insertUrl img').attr('src');
	InsertImage = '![](' + _image_url + ')';
	$('.editor-toolbar .insert-image').trigger('click');
	// $('#MdImage').modal('toggle');
});

$('#insertUrl').on('hidden.bs.modal', function () {
  $('#insertUrl input').val('');
  $('#insertUrl img').attr('src', '');
});

//Clear data on close
$('#MdImage').on('hidden.bs.modal', function () {

	$('#MdImage .images, #MdImage .actionsMdImage').empty();

});

//Save changes on a md file 
function saveChanges(_fm, _content){

	
	spinnerBtnUptodate();

	//update metadata value, depend sortableExtractCurrentUpdateValue, last-modified by default
	_fm=sortableUpdateFrontMatterWithCurrent(_fm);
	//add metadata
	var _saveContent='---\n' + $.trim(_fm) + '\n---\n';

	if (_content !== undefined)
	{		
		// add content
		_saveContent += _content;	
	}

	//commit message, filter path
	var commit_msg = commitMsgModifyCreateMd(CurrentPath,'modify_content');
	if ($("#commit").val()) {
	  CommitMsg = $("#commit").val();
	}
	
	UpdateCreateOneFile(CurrentPath, Git_refs_heads, _saveContent,"utf-8", commit_msg, function(data) {
		UpdateLocalRepo();	
    $('main .content').empty();
    if (CurrentPath.match('.md$')) {

			if (_fm.indexOf('CkEditor(Word)') > -1) 
			{			
				ckEditor(_content,_fm, 'main .content');
			}
			else {
				mdEditor(_content, _fm);
			}
    }	   
	 });	
}


//
$(document).on('click', '.actions .delete', function(){
	$('#confirmDelete').modal('toggle');
	$('#confirmDelete #Confirm').attr('data-path', $(this).attr('data-path'));
});

$(document).on('click', '#confirmDelete #Confirm', function()
{
	$('.deleting, .noclick').toggle();

	var _remove = $(this).attr('data-path');	

	var ref_del = 'main .content .list-group-item .delete';
	var ref_elt = '.list-group-item';

	var isPathImg = (CurrentPath.indexOf('/')==-1) ? CurrentPath.indexOf(PathImageRef)===0 : CurrentPath.indexOf(PathImageRef+'/')===0;
	if (isPathImg) 
	{
		ref_del = 'main .card .delete';
		ref_elt = '.card';
	}

	//specific section type page : must delete associated file on _pages/ and site-config/navigation/ folders
	var path_page,page_filename;
	var match_md = _remove.match(/\/index.md$/);
	var del_page_file = false;
	if ( match_md !== null) {
		path_page = _remove.substr(0,match_md.index);
		var last = path_page.lastIndexOf('/');
		var path_page_section = path_page.substr(0,last);		
		var isSectionPage = returnValue_extractPathsModelFm_KeyValue(PathsFmSectionsWithFileActions, path_page_section);
		if (isSectionPage === 'add_page') 
		{
			del_page_file = true;
			page_filename = path_page.substr(last+1);
		}
		
	}

	//promises
	var promPage;
	if (del_page_file) 
	{
		var promNavig, promPage, promHeaderSlider;


		promHeaderSlider = new Promise(function(resolve) {

			var ref_path=PageSectionRef.config_header.path_header_slider;
			var path_headerslider = ref_path.substring(ref_path.lastIndexOf('/'));
			path_headerslider = path_page + path_headerslider;

			ContentOcto(path_headerslider, Git_refs_heads, function(err,data_tree) {
				if(err===null){
					extract_info_from_tree(data_tree).then(function(){					
						DeleteSectionWithItems(path_headerslider,Current_git_items_tree,function(){
							UpdateLocalRepo();
							resolve();
						});					
					});
				}
				else {
					resolve();
				}
			});

		});
		promHeaderSlider.then(function() {

			promNavig = new Promise(function(resolve) {
				var NavigFilename_path = PageSectionRef.config.path_navigation+'/'+page_filename+'.md';
				var commit_msg = commitMsgDeleteFile(NavigFilename_path,isPathImg);		
				Delete(NavigFilename_path, Git_refs_heads, commit_msg, function() {
					resolve();
				});
			});
			promNavig.then(function() {	

				promPage = new Promise(function(resolve) {
					var PageFilename_path = PageSectionRef.config.path+'/'+page_filename+'.md';
					var commit_msg = commitMsgDeleteFile(PageFilename_path,isPathImg);		
					Delete(PageFilename_path, Git_refs_heads, commit_msg, function() {
						resolve();
					});
				});
				//and then update index.md linked to the new section with fm info
				promPage.then(function() {		
					delFileAndDisplay(_remove,isPathImg,ref_del,ref_elt);				
				});
			});
		})		
	}
	else
	{
		// promPage = new Promise(function(resolve){resolve();});
		delFileAndDisplay(_remove,isPathImg,ref_del,ref_elt);
	}

});

function delFileAndDisplay(path,isPathImg,ref_del,ref_elt)
{
	var commit_msg = commitMsgDeleteFile(path,isPathImg);
		
	Delete(path, Git_refs_heads, commit_msg, function() {
		UpdateLocalRepo();				
		$(ref_del).each(function(){
			if($(this).attr('data-path') === path){
				$(this).closest(ref_elt).remove();
				$('	.deleting, .noclick').toggle();
				return false;
			}
		});			
	});

}



//from modal (ref_modal parameter), update image with Md5Image
function updateImageFmEditor(name,ref_modal,key,force_hidden_form,callback) {
	
	if (name.length>0)
	{
		var _id_form='meta'+ref_modal+key;
		var _id_form_image='';
		var _id_form_comment='';
    var _input_type='text';
    var ref$='#'+ref_modal+' .modal-body .image-form ';
    var content='';
    var file_detect={};
    var file_defect='';

    var name_image=name;  
    var path_image_tmp=PathImageRef;

    if (name.split('/').length > 1) {	    	
    	if ( CurrentPathImage.endsWith(name.slice(0,name.lastIndexOf('/'))) )  
    	{
    		path_image_tmp+='/'+CurrentPathImage;
    	}
    	name_image=name.slice(name.lastIndexOf('/')+1);	    	
    }
    else {
    	if (CurrentPathImage!=='') {
    		path_image_tmp+='/'+CurrentPathImage;
    	}
    }
  
    //---------------------
    // from function : displayFormFmEditor    
    //title user
    var _label = currentLabelMdImage_gl[key];
    // extra checked input to display or not image
    var checked_id_ref = currentCheckedId_gl[key];
    var checked_id_alias = checked_id_ref + SufixIdCheckedInput;
    var checked_input = currentCheckedImage_gl[key];
    if (checked_input!=='') {
    	_id_form_image =_id_form+SufixIdCheckedFormImage;
    	_id_form_comment =_id_form+SufixIdCheckedFormComment;
    }
    
    //text comment
    var _comment = currentCommentImage_gl[key];
    var add_comment = '';
    if (_comment.length>0) {
    	add_comment='<small  class="form-text text-muted" id="'+ _id_form_comment + '">'+_comment+'</small>';
    }  
    //--------------------------

    // Before $(ref$).empty() : 
    // test if current image with checked value
    var checked_value_current;
    if (checked_input!=='') {
    	var id_checked_alias = checked_id_ref + SufixIdCheckedInput;
    	checked_value_current = $(id_checked_alias).prop('value');
    }
    
    
    //add div with class 'key' first pass, for each form with tag mniniature  
    var add_class_hidden='';
    if (force_hidden_form)
    	add_class_hidden=' u-hidden';

    var div_key = '<div class="' + PrefClassMdImageModal + key + add_class_hidden + '">';
    //then adapt ref$..
    var ref$_key = ref$ + ' .' + PrefClassMdImageModal + key;
    if ($(ref$_key).length > 0)
    {    	
    	ref$ = ref$_key;
    	div_key='';  

    	$(ref$).empty();  	
    }


    // $(ref$).empty();
    content=content+
    div_key+
	    '<div class="container-fluid">'+
				'<div class="row">'+					
	    		'<div class="col-xs-8">' +	
			    	'<fieldset>'+
			    		'<div class="form-group">'+
			    			'<label for="'+_id_form +'" class="">'+_label+'</label>'+
			    			'<div class="">'+
			    				checked_input +
			    				'<input disabled type="' +_input_type+'" class="form-control" value="'+name_image+'" id="'+_id_form+'">'+
			    			'</div>'+
			    			add_comment +
			    		'</div>'+
			    	'</fieldset>'+			    	
			    '</div>';	 
	   // </div></div></div>

		ContentOcto(path_image_tmp, Git_refs_heads, function(err,data_tree){

			data_tree.forEach(function(file, index) {
      	if(file.name === name_image){
      		file_detect=file;	            	    		            
      	}
    	});

    	if(!hasContentsObj(file_detect)) 
    	{
    		file_detect.name='';
    		file_detect.path='';
    		file_detect.downloadUrl='';
    		file_defect='<span style="color: #c9302c;font-size:5em;text-align: center;">X</span>';    
    	}

    	content=content+  
	      "<div class='col-xs-4'>" +          		
	       	"<div class='images' id='"+_id_form_image+"'>"+
	       		"<div class='card image' data-name='" + file_detect.name + "' data-path='" + file_detect.path + "'>"+
							"<div class='view overlay hm-white-slight'>"+
								"<img src='" + file_detect.downloadUrl + "' class='img-thumbnail'>"+ file_defect +    				
			        "</div>"+
			        "<div class='card-block'>"+
				        "<div class='actions'>"+											
									"<a href='"+file_detect.downloadUrl+"' target='_blank'><span class='watchRaw' title='Link to raw image'> <i class='fa fa-fw fa-2x fa-expand' aria-hidden='true'></i></span></a>"+
									"<span class='changeImage' title='Select a new image'><i class='fa fa-fw fa-2x fa-picture-o' aria-hidden='true'></i></span>"+
								"</div>"+
			    		"</div>"+
						"</div>"+
	  			"</div>"+
	  		"</div>";

    	content=content+'</div></div></div> ';//./ row , container, div_key

			$(ref$).append(content);

			//add event checked
			if (checked_input !== '') 
    	{
    		var id_checked_alias = checked_id_ref + SufixIdCheckedInput;
    		var checked_value = $(id_checked_alias).prop('value');
	  		activeCheckedImage(checked_id_ref,'#'+_id_form,checked_value_current)
    	}

			callback();  		
    });
	}
	else
	{
		callback();
	}
	
}


//from modal (ref_modal parameter), update image with Md5Image
function updateFontAwesomeFmEditor(name,ref_modal,key,callback)
{
	var icon_name = name;
	// hypothese : icon_name filtered, type font-awesome, default : fa-address-book
	// if (icon_name>0) {} // test (name.length>0)
	var fa_comment = "Choose new icon at <a href='http://fontawesome.io/icons/' target='_blank'><i class='fa fa-font-awesome fa-lg' aria-hidden='true'>&nbsp;<stronger>Font-Awesome</stronger></i></a>"

	var _id_form='meta'+ref_modal+key;
	var _input_type='text';
	var ref$='#'+ref_modal+' .modal-body .image-form';
	var content='';

	// from function : displayFormFmEditor
 	var _label = currentLabelMdImage_gl[key];

 	//add div with class 'key' first pass, for each form with tag mniniature    
    var div_key = '<div class="' + PrefClassMdImageModal + key+'">';
    //then adapt ref$..
    var ref$_key = ref$ + ' .' + PrefClassMdImageModal + key;
    if ($(ref$_key).length > 0)
    {    	
    	ref$ = ref$_key;
    	div_key='';  

    	$(ref$).empty();  	
    }

 
  $(ref$).empty();
  content=content+
  div_key+
    '<div class="container-fluid">'+
			'<div class="row">'+
    		'<div class="col-xs-8">' +	
		    	'<fieldset>'+
		    		'<div class="form-group">'+
		    			'<label for="'+_id_form +'" class="">'+_label+'</label>'+
		    			'<div class="">'+
		    				'<input type="' +_input_type+'" class="form-control" value="'+icon_name+'" id="'+_id_form+'">'+
		    			'</div>'+
		    			'<small  class="form-text text-muted">'+fa_comment+'</small>'+
		    		'</div></fieldset></div>';

 	content=content+  
    '<div class="col-xs-4">' +          		
    	'<div class=" images ">'+
    		'<i class="fa '+icon_name+' fa-4x"></i>'+ 
    		'<div class="actions">'+
					'<span class="updateFa">Update</span>'+
				'</div>'+     	
		'</div></div>';

	content=content+'</div></div></div> ';//./ row , container, div_key
	$(ref$).append(content); 

		 
	callback();
}

function filter_current_path_with_model(_current_path, path_model) 
{
	if (_current_path===path_model) 
	{
		return true;
	}
	//presence /$xxx on path
	var split_model = path_model.split('$xxx');
	var _path = _current_path;
	var last_iter = split_model.length-1;
	for (var i = 0; i < split_model.length; i++) 
	{
		if (_path.indexOf(split_model[i]) === 0) 
		{	
			//case last iter
			if (i === last_iter) 
			{
				return (_path === split_model[last_iter]);

			}
			else
			{
				_path = _path.substring(split_model[i].length);	

				//filtering custom /$xxx part path
				var index_custom = _path.indexOf('/')

				if (index_custom === -1)
				{
					if (i === (last_iter-1) && split_model[last_iter]==='') 
					{
						return true;
					}
					else
					{	return false;}
				}
				else
				{
					_path = _path.substring(index_custom);
				}			
			}			
		}
		else
		{	return false;}  			   			
	}

	//note : fixed ref uname folder	: $xxx			
	// var match_uname_folder = path_model.match(/\$xxx/g);
	// if (match_uname_folder !== null) {
	// 	var ref_name=path_model.replace(/\/\$xxx/g,'');
	// 	if (_current_path.indexOf(ref_name) === 0) {
	// 		var path_filtered = _current_path.substring(ref_name.length);
	// 		var nb_part=path_filtered.match(/\//g);

	// 		if (nb_part !== null && nb_part.length === match_uname_folder.length ) {
	// 			return true;
	// 		}
	// 	}
	// }
	return false;
}
//extract model of metadata, given a path
//to see conflict with recopy object, ok, on each iteration createItem, recup ref model
function extractMetadataFromModel(model_json,current_path) {

	//create new object, avoid conflict when manipulate the object, local recopy
	model_json_loc = $.extend(true, {}, model_json);
	

	function updateAddMetaOutput(output_toupdate, list_add) {

		var ouput=$.extend(true, {}, output_toupdate);

		Object.keys(list_add).forEach(function(key,index) {

			var key_to_add = key;
			var flag_add_key=true;

			//iter on key ouput if exist, then replace
			Object.keys(output_toupdate).forEach(function(key_ouput,index) {	
				if(key_ouput===key_to_add) {
					//replace object
					var value_key=list_add[key_ouput];
					output[key_ouput]=value_key;
					flag_add_key=false;
				}
			});
			if (flag_add_key === true) {
				var value_key=list_add[key_to_add];
				output[key_to_add]=value_key;
			}
		});
		return output;
	}

	var output={};
	model_json_loc.list.forEach(function(model, index) {

		var list_meta=model.list_meta;

		if(hasContentsObj(model.folderTree)) {
			model.folderTree.forEach(function(ref, index) {

				var update_output = filter_current_path_with_model(current_path, ref);

				if (update_output) {
					if(!hasContentsObj(output)) {
						output=list_meta;
					}
					else {
						output = updateAddMetaOutput(output ,list_meta);					
					}
				}
			});
		}
		else if(hasContentsString(model.folderTree)) {

			var update_output = filter_current_path_with_model(current_path, model.folderTree);
			if (update_output) {			
				if(!hasContentsObj(output)) {
					output=list_meta;
				}
				else {
					output = updateAddMetaOutput(output ,list_meta);					
				}
			}
		}
	});
	return output;
}

function fixedEncodeURIComponent (str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}
//return front matter to put on raw file when create, update
// ModifiedFilename var global, updated
function fmUpdatedFromEditor(fm_info,ref_modal){


	//extra filtering
	var extra_list_input_color = '';
	var list_input_color=''
	Object.keys(fm_info).forEach(function(key,index) {

		if (fm_info[key].input_list_id_value !== undefined &&fm_info[key].input_list_id_value === 'color') 
  	{
  		extra_list_input_color=key;
  	}
	});

	//update raw front matter
	var fm_updated='---\n';
	Object.keys(fm_info).forEach(function(key,index) {	   		   
		var _id_form='#meta'+ref_modal+key;
		var value_key='';

		var _tag=fm_info[key].form.tag;
		var _type=fm_info[key].form.type;
		var _filter_own_domain_url=fm_info[key].filter_own_domain;

    if(_tag==="input" ) 
    {
    	//specific date, utc date put on alternate field
    	if ( key.indexOf('date')==0 ) 
    	{
    		var id_alt = _id_form + '-alt';
    		var date_alt = $(id_alt).prop('value');
    		if (date_alt !== undefined && date_alt !== '') 
    		{
	    		value_key=$(id_alt).prop('value').trim();
	    		var format_date = moment(value_key).format('Y-MM-DD');
	    		var isSameDay = moment().isSame(format_date,'day');
	    		var isBeforeDay = moment().isBefore(format_date,'day');

	    		var time = '12-00-00';
	    		if (isSameDay) {
	    			time = moment().subtract(1, 'hours').format('HH-mm-ss');
	    		}
	    		if (isBeforeDay) {
	    			time = '01-00-00'; //display early
	    		}
	    		value_key=format_date+' '+time;	    	
	    	}

    	}
    	else 
    	{    	
	    	if ($(_id_form).prop('value') !== undefined) {
	    		value_key=$(_id_form).prop('value').trim();	  
	    	}
	    }

    	if(_filter_own_domain_url!==undefined && _filter_own_domain_url===true){
    		var url_filtered=value_key;
    		if(url_filtered.indexOf('http')===0) {
    			url_filtered=url_filtered.replace(/^https?:\/\/[\w\d-.:]{1,}\//,'');
    		}
    		if (url_filtered.indexOf('/')!==0) {
    			url_filtered='/'+url_filtered;
    		}
    		//filtering base_url
    		if (base_url!=='') {
    			if (url_filtered.indexOf(base_url)===0) {
    				url_filtered=url_filtered.slice(base_url.length);
    			}
    			
    		}
    		value_key=url_filtered;
    	}	

    	if (extra_list_input_color.length>0) 
    	{
    		if (key === extra_list_input_color)
    			return false;

    		if ( _type === 'color') 
    		{
	    		if (list_input_color !== '') {
	    			list_input_color += ',';
	    		}
	    		list_input_color += key + ':' + value_key;
	    	}
    	}

    	
    	if (value_key.indexOf('#') > -1) 
    	{
    		value_key='"'+value_key+'"';
    	}
    }	    
    else if (_tag==="textarea") {
    	//value_key=$(_id_form).prop('value').trim();	 
    	var lines=$(_id_form).val().split('\n');
    	lines.forEach(function(line,index) {
    		if (index>0) {
    			value_key+='<br/>'; //ok avec jekyll!
    		}
    		value_key+=line;
    	});
    }
		else if (_tag==="select") {
			var nb_selected=0;
			_id_form=_id_form+' option:selected';
			$(_id_form).each(function() {
		    value_key=value_key+'"'+$(this).val()+'"'+',';
		    nb_selected++;
		  });
			if (value_key.length>0) {
				value_key=value_key.substring(0,value_key.length-1);
				if (nb_selected>1) {
					value_key='['+value_key+']';
				}
				else {
					value_key=value_key.substring(1,value_key.length-1);
				}					
			}			
    }
    else if (_tag==="image" ) {

    	if ($(_id_form).prop('value') !== undefined) 
    	{
    		var path = CurrentPathImage;
    		var add_path_on_value = true;
    		
    		//filter cas icon font-awesome
    		if (fm_info[key].display_depend_on_extra === 'font-awesome') 
    		{
    			var key_is_fa = fm_info[key].display_depend_on;
    			var id_is_fa = '#meta'+ref_modal+key_is_fa+' option:selected';
    			var elt_is_fa = $(id_is_fa);
    			if (elt_is_fa.length === 1 && elt_is_fa.val() === 'font-awesome') 
    			{
    				add_path_on_value=false;
    			}
    		}

    		if (CurrentPathImage.indexOf(PathImagePictOriginals+'/') === 0) 
    		{
    			path = CurrentPathImage.slice(PathImagePictOriginals.length+1);
    		}

    		value_key = add_path_on_value ? path + '/' : '';
    		value_key += $(_id_form).prop('value').trim();	  
    	}    	
    }	 


    if ( key.indexOf('last_modified')>-1) 
    {    	
  		value_key=CurrentDateTimeUtc(); //force type, needed in sortable_custom
  	}
    
    //filtering ':', ommit date,  url if not on title key
    if (key.indexOf('date')!==0 && key.indexOf('last_modified')===-1) {

    	var filter_value = true;
    	if (value_key.indexOf('http://') > -1)
    		filter_value = false;
    	if (value_key.indexOf('https://') > -1)
    		filter_value = false;

    	if (key === 'title')
    		filter_value = true; //force case with title, need to create file

    	if (filter_value) {
    		value_key=value_key.replace(/[:]/g,'-'); //filter all ':' with md
    	}
    	else 
    	{	//filter other part than url
    		value_key=value_key.replace(/\s[:]/g,' -'); //filter only ' :' with md
    		value_key=value_key.replace(/[:]\s/g,'- '); //filter only ': ' with md
    	}
    }
    
    //modif title? adapt filename, path change
    if (key==='title') {	    	
    	// if ( value_key !== fm_info[key] ) {
    		ModifiedFilename=value_key.toLowerCase().replace(/\s+/g, '-')
	    		.replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[ïî]/g,'i')
	    		.replace(/[ôö]/g,'o').replace(/[ùûü]/g,'u').replace(/[ÿ]/g,'y').replace(/[ç]/g,'c'); 

	    	if (ModifiedFilename !== fixedEncodeURIComponent(ModifiedFilename)) {
	    		var filterFilename='';
	    		//filter encodage, else bug  with github api
	    		for (var i = 0; i < ModifiedFilename.length; i++) {
	    			var _char = ModifiedFilename[i];
	    			if (_char === fixedEncodeURIComponent(_char)) {
	    				filterFilename += _char;
	    			}		    			   			
	    		}
	    		ModifiedFilename=filterFilename;
	    	}
	    	ModifiedFilename=ModifiedFilename+'.md';
    	// }	    	
    }
    //form front matter updated




  
    line_meta=key+' : '+value_key;
    fm_updated+=line_meta+'\n';

	});
	
	//add extra filtering 
	if (extra_list_input_color.length>0) 
	{
		value_key='"'+list_input_color+'"';
		line_meta=extra_list_input_color+' : '+value_key;
		fm_updated+=line_meta+'\n';

	}

	fm_updated=fm_updated+'---\n';

	return fm_updated;

}

function extractPathsModelFm(modelJson) {
	// push all path on the output
	var output=[];
	modelJson.list.forEach(function(model, index) {

		if(hasContentsObj(model.folderTree)) {
			model.folderTree.forEach(function(ref) {
				var flag_present=false;
				output.forEach(function(value) {
					if (ref===value) {
						flag_present=true;
					}
				});
				if (flag_present === false) {
					output.push(ref);
				}
				
			});
		}
		else if(hasContentsString(model.folderTree)) {
			var flag_present=false;
			output.forEach(function(value) {
				if (model.folderTree===value) {
					flag_present=true;
				}
			});
			if (flag_present === false) {
				output.push(model.folderTree);
			}		
		}
	});
	return output;
}

function extractPathsModelFmCreateOnly(modelJson, inv_logic) {
	// push path on the output; fn: model[ "modifyOnly" ] and inv_logic
	var output=[];
	modelJson.list.forEach(function(model, index) {

		if (inv_logic!==undefined && inv_logic === true) {
			//return output when  [ "modifyOnly": true ]
			var test_create_only=false;
			if(model.modifyOnly!==undefined && model.modifyOnly === true)
			{
				test_createOnly = true;
			}
		}
		else {
			//return output when not  [ "modifyOnly": true ]
			var test_createOnly=true;

			if(model.modifyOnly!==undefined && model.modifyOnly === true)
			{
				test_createOnly = false;
			}
		}

		if (test_createOnly) {

			if(hasContentsObj(model.folderTree)) {
				model.folderTree.forEach(function(ref) {
					var flag_present=false;
					output.forEach(function(value) {
						if (ref===value) {
							flag_present=true;
						}
					});
					if (flag_present === false) {
						output.push(ref);
					}
					
				});
			}
			else if(hasContentsString(model.folderTree)) {
				var flag_present=false;
				output.forEach(function(value) {
					if (model.folderTree===value) {
						flag_present=true;
					}
				});
				if (flag_present === false) {
					output.push(model.folderTree);
				}		
			}
		}
	});
	return output;
}

function extractPathsModelFm_KeyBoolIsRef(modelJson,key,value_ref_bool) {
	// push path on the output when model[ "key" ] === "value_ref_bool" 
	var output=[];
	modelJson.list.forEach(function(model, index) 
	{		
		var test_canAdd=false;
		var current_value;
		if (typeof(model[key]) !== 'undefined')
		{
			current_value = model[key];
			if (current_value === value_ref_bool) 
			{
				test_canAdd = true;
			}
		}			

		if (test_canAdd) {

			if(hasContentsObj(model.folderTree)) {
				model.folderTree.forEach(function(ref) {
					var flag_present=false;
					output.forEach(function(value) {
						if (ref===value) {
							flag_present=true;
						}
					});
					if (flag_present === false) {
						output.push(ref);
					}
					
				});
			}
			else if(hasContentsString(model.folderTree)) {
				var flag_present=false;
				output.forEach(function(value) {
					if (model.folderTree===value) {
						flag_present=true;
					}
				});
				if (flag_present === false) {
					output.push(model.folderTree);
				}		
			}
		}
	});
	return output;
}

function extractPathsModelFm_KeyValue(modelJson,key) {
	// push [path value] on the output when model[ "key" ] !== "undefined" 
	var output=[];
	modelJson.list.forEach(function(model, index) 
	{
		var test_canAdd=false;		
		var current_value;
		if (typeof(model[key]) !== 'undefined')
		{
			current_value = model[key];
			test_canAdd = true;			
		}			

		if (test_canAdd) {

			if(hasContentsObj(model.folderTree)) {
				model.folderTree.forEach(function(ref) {
					var flag_present=false;
					output.forEach(function(value) {
						if (ref===value[0]) {
							flag_present=true;
						}
					});
					if (flag_present === false) {						
						// output.push(ref);					
						var keyvalue = [];
						keyvalue.push(ref);
						keyvalue.push(current_value);
						output.push(keyvalue);						
					}					
				});
			}
			else if(hasContentsString(model.folderTree)) {
				var flag_present=false;
				output.forEach(function(value) {
					if (model.folderTree===value[0]) {
						flag_present=true;
					}
				});
				if (flag_present === false) {
					// output.push(model.folderTree);
					var keyvalue = [];
					keyvalue.push(model.folderTree);
					keyvalue.push(current_value);
					output.push(keyvalue);
				}		
			}
		}
	});
	return output;
}

function returnValue_extractPathsModelFm_KeyValue (list_folders, _current_path) {
	var returnValue;
	list_folders.forEach(function(folder) {		
		var key = folder[0];
		var value = folder[1];
		var update_output = filter_current_path_with_model(_current_path, key);
		if (update_output) {
			returnValue = value;
		}
	});
	return returnValue;
}


function extractPathsModelFm_pathImg(modelJson) {
	// push path on the output where title can't be modified :
	//  list_meta.title["show_enabled_on_create_only"] === true
	// filter case where force_not_adapt_path_img_section === true
	var output=[];
	modelJson.list.forEach(function(model, index) {

		var add_path = false;		
		if(hasContentsObj(model.list_meta.title) && model.list_meta.title["show_enabled_on_create_only"] !== undefined)
		{
			// add_path = model.list_meta.title["show_enabled_on_create_only"];
			if (!(model.force_not_adapt_path_img_section === true))
			{
				add_path = model.list_meta.title["show_enabled_on_create_only"];			
			}			
		}



		if (add_path) 
		{	
			if(hasContentsObj(model.folderTree)) {
				model.folderTree.forEach(function(ref) {
					var flag_present=false;
					output.forEach(function(value) {
						if (ref===value) {
							flag_present=true;
						}
					});
					if (flag_present === false) {
						output.push(ref);
					}
					
				});
			}
			else if(hasContentsString(model.folderTree)) {
				var flag_present=false;
				output.forEach(function(value) {
					if (model.folderTree===value) {
						flag_present=true;
					}
				});
				if (flag_present === false) {
					output.push(model.folderTree);
				}		
			}
		}
	});
	return output;
}

function returnArrayPath_extractPathsModelFm (list_folders, _current_path) {
	var list_path=[];
	list_folders.forEach(function(path_to_create) {		
		var update_output = filter_current_path_with_model(_current_path, path_to_create);
		if (update_output) {
			list_path.push(path_to_create);
		}
	});
	return list_path;
}

//+++++++++++++++++++++++
//Update metadata    ++++
//+++++++++++++++++++++++

//modal Detail metadata md files/sections on show content folder, fn OpenSection()
// in input : Current_git_items_tree , Current_raw_info_fm_items_tree
$(document).on('click', '.actions .metadata', function(){

	$('#displayMeta .modal-body .all-forms').empty();
	$('#displayMeta .modal-body .image-form').empty();
	$('#displayMeta .modal-footer button').prop('disabled', true);

	Current_git_item={};
	Current_info_fm_item={};
	Current_raw_info_fm_item={};
	var _current_path=$(this).attr('data-path');
	var data_index_current=$(this).attr('data-index');
	var current_data_type=$(this).attr('data-type');

	//update index current item	
	if (data_index_current !== undefined) {
		index_current_raw_item_ref=parseInt(data_index_current,10);
	}
	

	Current_git_items_tree.forEach(function(value, index) {
		if(value.path===_current_path) {
			Current_git_item=$.extend(true, {}, value);
			if (Current_raw_info_fm_items_tree[index] !== undefined) {
				Current_raw_info_fm_item=Current_raw_info_fm_items_tree[index];
			}			
		}
	});
	//recup model
	var match_md = _current_path.match(/\.md$/);
	if ( match_md !== null) 
	{		
		// case files		
		ModelsFmItemFilter = $.extend(true, {}, ModelsFmItemFilterRef);
		Current_info_fm_item = extractMetadataFromModel(ModelsFmItemFilter,CurrentPath);	
	}
	else 
	{
		//case section
		ModelsFmSectionFilter = $.extend(true, {}, ModelsFmSectionFilterRef);
		Current_info_fm_item = extractMetadataFromModel(ModelsFmSectionFilter,CurrentPath);	
		if (Object.keys(Current_info_fm_item).length === 0) {
			Current_info_fm_item = extractMetadataFromModel(ModelsFmSectionFilter,_current_path);	
		}
		Current_git_item.path+='/index.md';//force path to correspondant file with fm info
	}	 

	var ref_modal = 'displayMeta';	

	if(hasContentsObj(Current_info_fm_item))
	{
		displayFormFmEditor(Current_info_fm_item,ref_modal);		
	}
	else 
	{
		$('#displayMeta .modal-body .all-forms').append(
			'<p> Cant load the metadata. Please contact your administrator</p>');
	}	

	//datepicker on metadisplayMetadate
	var metaTmp=undefined;
	var formatDateTmp=undefined;
	if ($('#metadisplayMetadate').length>0) {
		ValueMetadatePost = $('#metadisplayMetadate').val();
		metaTmp='#metadisplayMetadate';		
		formatDateTmp=Current_info_fm_item['date'].form.value;	
		customDatepicker(metaTmp,formatDateTmp);
	} 
	if ($('#metadisplayMetadate-publication').length>0) {		
		metaTmp='#metadisplayMetadate-publication';
		formatDateTmp=Current_info_fm_item['date-publication'].form.value;
		customDatepicker(metaTmp,formatDateTmp);
	}
	if ($('#metadisplayMetadate-debut-promotion').length>0) {
		metaTmp='#metadisplayMetadate-debut-promotion';
		formatDateTmp=Current_info_fm_item['date-debut-promotion'].form.value;
		customDatepicker(metaTmp,formatDateTmp);
	}
	if ($('#metadisplayMetadate-fin-promotion').length>0) {
		metaTmp='#metadisplayMetadate-fin-promotion';
		formatDateTmp=Current_info_fm_item['date-fin-promotion'].form.value;
		customDatepicker(metaTmp,formatDateTmp);
	}
	if ($('#metadisplayMetadate-evenement').length>0) {
		metaTmp='#metadisplayMetadate-evenement';
		formatDateTmp=Current_info_fm_item['date-evenement'].form.value;
		customDatepicker(metaTmp,formatDateTmp);
	}
	if ($('#metadisplayMetadate-fin-evenement').length>0) {
		metaTmp='#metadisplayMetadate-fin-evenement';
		formatDateTmp=Current_info_fm_item['date-fin-evenement'].form.value;
		customDatepicker(metaTmp,formatDateTmp);
	}	


	$('#displayMeta input,#displayMeta textarea,#displayMeta select').on('input', function(){
		$('#displayMeta .modal-footer button').prop('disabled', false);
	});

	$('#displayMeta input[type=checkbox]').on('click', function(){
		$('#displayMeta .modal-footer button').prop('disabled', false);
	});


	$('#displayMeta').modal('toggle');

});




function activeCheckedInput(id_checked_ref,id_form)
{
	var id_checked_alias = id_checked_ref + SufixIdCheckedInput;

	var checked_value = $(id_checked_alias).prop('value');
	if (checked_value === undefined || checked_value === 'false') 
	{
		$(id_checked_ref).attr('checked', false);
		$(id_checked_alias).attr('checked', false);
		$(id_checked_alias).prop('value','false');
		$(id_form).addClass('u-hidden');

	}
	else
	{
		$(id_checked_ref).attr('checked', true);
		$(id_checked_alias).attr('checked', true);
		$(id_checked_alias).prop('value','true');
		$(id_form).removeClass('u-hidden');
	}
	
	
	setTimeout(function() {
		$(id_checked_alias).click(
			{
				id_checked_ref: id_checked_ref,
				id_form: id_form
			},
			updateCheckedInput);						
	}, 500);	
}

function updateCheckedInput(event) {

	var id_checked_ref = event.data.id_checked_ref;
	var id_checked_alias = id_checked_ref + SufixIdCheckedInput;
	var id_form = event.data.id_form;

	// if ($(id_checked_alias)[0].checked == true)
	if($(id_checked_alias).is(':checked'))
	{
		$(id_checked_ref).prop('value','true');
		$(id_checked_alias).prop('value','true');
		$(id_form).removeClass('u-hidden');
	}
	else
	{
		$(id_checked_ref).prop('value','false');
		$(id_checked_alias).prop('value','false');
		$(id_form).addClass('u-hidden');
	}
}

function activeCheckedImage(id_checked_ref,id_form,force_checked_value)
{
	var id_checked_alias = id_checked_ref + SufixIdCheckedInput;
	//extra id , specific immage form
	var id_form_image = id_form + SufixIdCheckedFormImage;
	var id_form_comment = id_form + SufixIdCheckedFormComment;

	var test = $(id_checked_alias).is(':checked');

	var checked_value = $(id_checked_alias).prop('value');
	if (force_checked_value !== undefined)
		checked_value = force_checked_value;

	if (checked_value === undefined || checked_value === 'false') 
	{
		$(id_checked_ref).prop('value','false');
		$(id_checked_alias).prop('value','false');
		$(id_checked_alias).attr('checked', false);
		$(id_form).removeClass('u-hidden');
		$(id_form_image).removeClass('u-hidden');
		$(id_form_comment).removeClass('u-hidden');
	}
	else
	{
		$(id_checked_ref).prop('value','true');
		$(id_checked_alias).prop('value','true');
		$(id_checked_alias).attr('checked', true);		
		$(id_form).addClass('u-hidden');
		$(id_form_image).addClass('u-hidden');
		$(id_form_comment).addClass('u-hidden');
	}
	
	setTimeout(function() {
		$(id_checked_alias).click(
			{
				id_checked_ref: id_checked_ref,
				id_form: id_form
			},
			updateCheckedImage);						
	}, 500);	
}

function updateCheckedImage(event) {

	var id_checked_ref = event.data.id_checked_ref;
	var id_checked_alias = id_checked_ref + SufixIdCheckedInput;
	var id_form = event.data.id_form;
	//extra id , specific immage form
	var id_form_image = id_form + SufixIdCheckedFormImage;
	var id_form_comment = id_form + SufixIdCheckedFormComment;

	var checked_value = $(id_checked_alias).prop('value');

	// if ($(id_checked)[0].checked == true)
	if($(id_checked_alias).is(':checked'))
	{
		$(id_checked_ref).prop('value','true');
		$(id_checked_alias).prop('value','true');
		$(id_form).addClass('u-hidden');
		$(id_form_image).addClass('u-hidden');
		$(id_form_comment).addClass('u-hidden');
	}
	else
	{
		$(id_checked_ref).prop('value','false');
		$(id_checked_alias).prop('value','false');
		$(id_form).removeClass('u-hidden');
		$(id_form_image).removeClass('u-hidden');
		$(id_form_comment).removeClass('u-hidden');
	}

	//extra case display metadata
	$('#displayMeta .modal-footer button').prop('disabled', false);
}



function customDatepicker(meta,formatDate) 
{
	
	var dateFormatDisplay="MM dd, yy"; //international: April 01, 2017

	// add lang, add regional in /public/assets/js/jquery-ui-1.12.0.custom/jquery.ui.datepicker-fr.js
	var lang_ext = "_fr";
	var test_ext=formatDate.length - formatDate.indexOf(lang_ext) - lang_ext.length;
	if(test_ext===0) {
		$.datepicker.setDefaults( $.datepicker.regional.fr);
		dateFormatDisplay = "dd MM yy"  // french: 01 Avril 2017
	}
	
	// if (formatDate.indexOf('_time') > 0) {
	// 	dateFormatDisplay += " 12:00:00" 
	// }

	var alt_field_id = meta + '-alt';
	var alt_format = "yy-mm-dd"; //add time part on fn fmUpdatedFromEditor()

	$(meta).datepicker({
		inline:true,
		altField: alt_field_id,
    altFormat:alt_format,
	 	showOn: "button",
	  	buttonImage: "assets/js/jquery-ui-1.12.0.custom/images/calendar.gif",
	  	buttonImageOnly: true,
	  	buttonText: "Select. date",
	  	dateFormat: dateFormatDisplay 
	})
	.on( "change", function() {		 	
	 	var widget = $(meta).datepicker( "widget" );
	 	if(ValueMetadatePost!==undefined) ValueMetadatePost = $(meta).val();
	 	//see revalidate post, todo
	 	// var alt_field_id = meta + '-alt';
	 	// var test_alt = $(alt_field_id).val();
	 	$('#displayMeta .modal-footer button').prop('disabled', false);	 	
	});

}

//option to change the image, interraction with MdImage module
$(document).on('click', '#displayMeta .actions .changeImage', function(){	
	
	CallerMdImageModal='displayMeta';

	//det current key, KeyMdImageModal, on parents, search div_key	
	// used when select new image : see $('body').on('click', '#MdImage .card .card-block > .select_mdimage', function(){	
	KeyMdImageModal='';
	var that = $(this);	
	var max_length=0;
	Object.keys(currentCommentImage_gl).forEach(function(key,index) {
		var class_tmp = '.' + PrefClassMdImageModal + key;
		var current_length = that.parents(class_tmp).length
		if ( current_length > max_length)
		{
			KeyMdImageModal = key;
			max_length = current_length;
		}
	});
	
	$('#displayMeta').modal('toggle');
	$('#MdImage').modal('toggle');
	
	var path_image_tmp=PathImageRef;
	if (CurrentPathImage!=='') {
		path_image_tmp+='/'+CurrentPathImage;
	}
	MdImage_select(path_image_tmp);
});


//save modification on front matter editor
$('body').on('click', '#displayMeta .modal-footer .btn', function(){

	ModifiedFilename='';
	ModifiedContent='';
	var _id_form;
	var value_key;
	var line_meta;

	$('.loading, .noclick').toggle();
	$('#displayMeta').modal('toggle');

	fm_updated = fmUpdatedFromEditor(Current_info_fm_item,'displayMeta');

	
	// recup raw data blob and update fm part
	ReadBlob(Current_git_item.path, Git_refs_heads, function(data) {
		
		//extract content
		var content =  extractContentMdFile(data);		
		ModifiedContent=fm_updated+content;		
		
		var prom=new Promise(function(resolve, reject) {

			var match_md = Current_git_item.name.match(/\.md$/);
			if ( match_md !== null) {			
				//case item
				if (Current_git_item.name !== ModifiedFilename) {
					//change title, delete current file
					var commit_msg = 'Modify filename item ' + Current_git_item.name + ' to '+ModifiedFilename;
					Delete(Current_git_item.path, Git_refs_heads,commit_msg, function() {
						resolve();
					});
				}
				else {
					resolve();
				}
			}
			else {
				//cas section
				//first iter : don't modify the name folder (info folder name on serve display on editor)
				//todo adpat the name, pb with image path
				var findIn = decodeURI((Current_git_item.path).replace(/\/index\.md$/, ''));
		    	ContentOcto(findIn, Git_refs_heads, function(err,data){
		    		resolve();
				 });
				
			}
			
		});
		//and then create new file path_file:"_posts/2017-01-17-test2.md" ModifiedFilename:"test2.md"  Current_git_item.name:2017-01-17-test2.md
		prom.then(function(){

			var path_file=Current_git_item.path;
			var match_md = Current_git_item.name.match(/\.md$/);
			
			if ( match_md !== null) 
			{
				if (path_file.indexOf('_posts/')===0) {
					if (ValueMetadatePost !== undefined) {
						var datetemp = new Date(ValueMetadatePost);
						ModifiedFilename=moment(datetemp).format("Y-MM-DD")+'-'+ModifiedFilename;
					}
					else {
						ModifiedFilename=moment().format("Y-MM-DD")+'-'+ModifiedFilename;
					}					
				}
				var path_section = path_file.substring(0,path_file.indexOf(Current_git_item.name));
				if (Current_git_item.name !== ModifiedFilename) {
					path_file= path_section + ModifiedFilename;
				}
			}
			else {
			}

			var commit_msg = commitMsgModifyCreateMd(path_file,'modify_meta');
			
			UpdateCreateOneFile(path_file, Git_refs_heads, ModifiedContent,"utf-8", commit_msg, function(data) {
				UpdateLocalRepo();	
				OpenSection(CurrentName, CurrentPath);				
				$('.loading, .noclick').toggle();
			});
		});

			
	});

	
});
//++++++++++++++++++++++++++++
// end Update metadata    ++++
//++++++++++++++++++++++++++++

//++++++++++++++++++++++
// Duplicate file    +++
//++++++++++++++++++++++
//force title and filename with -Duplic at the end
//update date and last_modified to current
// todo : add modal with change to title, option radio add content
$(document).on('click', '.actions .duplicate', function(){

	
	Current_git_item={};
	Current_info_fm_item={};
	Current_raw_info_fm_item={};
	var _current_path=$(this).attr('data-path');
	Current_git_items_tree.forEach(function(value, index) {
		if(value.path===_current_path) {
			Current_git_item=$.extend(true, {}, value);
			if (Current_raw_info_fm_items_tree[index] !== undefined) {
				Current_raw_info_fm_item=Current_raw_info_fm_items_tree[index];
			}			
		}
	});
	//recup model
	var match_md = _current_path.match(/\.md$/);
	if ( match_md !== null && Current_raw_info_fm_item !== undefined) {

		$('.loading, .noclick').toggle();
		// recup raw data blob and update fm part
		ReadBlob(Current_git_item.path, Git_refs_heads, function(data) {

			var commit_msg_extra = Current_raw_info_fm_item.title;
			//extract content
			var content =  extractContentMdFile(data);			
			
			//adapt title, filename
			var tag_duplic= '-Duplic';
			Current_raw_info_fm_item.title += tag_duplic;
			ModifiedFilename=_current_path.replace(/\.md$/,tag_duplic+'.md');
			//date publication to current
			if (Current_raw_info_fm_item.date !== undefined) {
				Current_raw_info_fm_item.date = CurrentDateTimeUtc();//force type
			}
			if (Current_raw_info_fm_item['date-publication'] !== undefined) {
				Current_raw_info_fm_item['date-publication'] = CurrentDateTimeUtc();//force type
			}			
			Current_raw_info_fm_item.last_modified = CurrentDateTimeUtc(); //force type
			//form fm updated
			var fm_updated='---\n';
			Object.keys(Current_raw_info_fm_item).forEach(function(key,index) {
				var line_meta=key+' : '+Current_raw_info_fm_item[key];
			    fm_updated+=line_meta+'\n';
			});
			fm_updated=fm_updated+'---\n';

			ModifiedContent=fm_updated+content;

			var prom=new Promise(function(resolve, reject) {		
			
				ShaFolder(ModifiedFilename, Git_refs_heads, function(data) {
					if (data!==undefined) {
						//fichier with this filename exist
						//add unix timestamp
						var new_ext='-'+moment().format('x')+'.md';
						ModifiedFilename=ModifiedFilename.replace(/\.md$/,new_ext);
					}			
					resolve();
				});		
			});
			//and then create new file
			prom.then(function(){
				
				var commit_msg = commitMsgModifyCreateMd(ModifiedFilename,'duplicate',commit_msg_extra);

				UpdateCreateOneFile(ModifiedFilename, Git_refs_heads, ModifiedContent, "utf-8", commit_msg, function(data) {
					UpdateLocalRepo();	
					OpenSection(CurrentName, CurrentPath);			
					$('.loading, .noclick').toggle();
				});
			});				
		});
	}
});


function CurrentDateTimeUtc(){
	// moment.locale();
	moment.locale('en');
	return  moment().subtract(1, 'hours').format('Y-MM-DD HH-mm-ss');
}
function date_Utc2Fr(_date_utc) {date_Utc2Fr
	moment.locale('fr');
	var conv_date = moment(_date_utc, 'Y-MM-DD HH-mm-ss', true).format('DD MMMM Y');
	return  conv_date;
}
function date_Utc2Int(_date_utc) {
	moment.locale('en');
	// return  moment(_date_utc).format('MMMM DD, Y');
	var conv_date = moment(_date_utc, 'Y-MM-DD HH-mm-ss', true).format('MMMM DD, Y');
	return  conv_date;
}


function hasContentsString(data) {
	if (data && typeof data === 'string' && data.length > 0) {
    	return true;
    }
    return false;
}
function hasContentsObj(data) {
	if (data && typeof data === 'object' && Object.getOwnPropertyNames(data).length>0) {
    	return true;
    }
    return false;
}


function displayFormFmEditor(fm_object,ref_modal) {

	var refForm$ = '#'+ ref_modal +' .modal-body .all-forms';

	currentCommentImage_gl={};
	currentLabelMdImage_gl={};
	currentCheckedId_gl={};
	currentCheckedImage_gl={};

	Object.keys(fm_object).forEach(function(key,index) {

		var _id_form='meta'+ref_modal+key;
		var _titleLabel=key;
	  var _hide_form=false;
	  var _disabled_form=false;
	  var _key_depend_on='';
	  var _value_depend_on='';
	  var _extra_depend_on='';
	  var _key_comment_depend_on_input='';
	  var _key_comment_depend_on_section='';
	  var _key_comment_input_ref='';
	  var _comment_add_on_create='';

		//update _titleLabel if trad_editor defined
		if (hasContentsString(fm_object[key].trad_editor)) {
			_titleLabel=fm_object[key].trad_editor;
		}

		//def is form is hidden on editor
		if (fm_object[key].show_editor !== undefined && fm_object[key].show_editor!==true) {
			_hide_form=true;
		}
		if(ref_modal=='displayMeta') {
			if(fm_object[key].show_on_create_only !== undefined && fm_object[key].show_on_create_only===true ) {
				_hide_form=true;
			}
		}
		if(ref_modal==='createItem') {
			if (key.indexOf('type_editor') === 0 && index_current_raw_section_ref > -1) 
			{
				if (Current_raw_info_fm_section_ref["type_child_editor"] !== undefined) {
					if (Current_raw_info_fm_section_ref["type_child_editor"] === 'NoEditor') {
						_hide_form=true;
					}
				}
			}			
		}

		
		//def if form must be disabled on editor
		if (key.indexOf('date') === 0) {
			_disabled_form=true;
		}
		if (fm_object[key].show_disabled_field !== undefined && fm_object[key].show_disabled_field===true) {
			_disabled_form=true;
			if(ref_modal==='createItem' || ref_modal==='createSection') {
				if(fm_object[key].show_enabled_on_create_only !== undefined && fm_object[key].show_enabled_on_create_only===true ) {
					_disabled_form=false;
				}
			}
		}

		//extra display_depend_on, 
		// !! hypoth from select form, else see checked_input to add checkbox on a form
		if (fm_object[key].display_depend_on !== undefined ) {
			_key_depend_on=fm_object[key].display_depend_on;

			if (fm_object[key].display_depend_on_extra !== undefined)
		  	_extra_depend_on = fm_object[key].display_depend_on_extra;

		  if (ref_modal === 'displayMeta') 
			{				
				if (Current_raw_info_fm_items_tree[index_current_raw_item_ref][_key_depend_on] !== undefined) {
					_value_depend_on=Current_raw_info_fm_items_tree[index_current_raw_item_ref][_key_depend_on];			
				}
			}    			
			if (_value_depend_on === '') 
			{	
				if (fm_object[_key_depend_on]!==undefined) 
  			{
  				var obj = fm_object[_key_depend_on];
  				if (obj.form.tag==='select') 
  				{
  					if (obj.form.options !== undefined && obj.form.options.length > 0) 
  					{
  						_value_depend_on=obj.form.options[0];
  					}
  				}
    		}
    	}				
		}
		//extra display comment
		if (fm_object[key].comment_add_text_from_input !== undefined ) {
			_key_comment_depend_on_input=fm_object[key].comment_add_text_from_input;						
		}
		if (fm_object[key].comment_add_text_from_section !== undefined ) {
			_key_comment_depend_on_section=fm_object[key].comment_add_text_from_section;						
		}		
		if (fm_object[key].input_reference_comment !== undefined ) {
			_key_comment_input_ref=fm_object[key].input_reference_comment;							
		}
		if (fm_object[key].comment_add_text_on_create !== undefined ) {
			if(ref_modal==='createItem' || ref_modal==='createSection')
				_comment_add_on_create='<strong style="color:#5BC0DE;">'+fm_object[key].comment_add_text_on_create+'</strong><br/>';							
		}

		
		//----------
    //Display
    //----------
    if (hasContentsObj(fm_object[key].form)) 
    {
    	var _form=fm_object[key].form;

    	var _tag='';
    	if (hasContentsString(_form.tag)) {
				_tag=_form.tag;
			}
			var tag_form;

			var _comment='';
			//----------------------------------------
			//gestion comment
			_comment += _comment_add_on_create;
			if (fm_object[key].form.comment !== undefined && fm_object[key].form.comment.length > 0) 
			{
				_comment += fm_object[key].form.comment;
			}
			//--
			if (_key_comment_depend_on_section !== '' )//&& ref_modal === 'displayMeta') 
			{
				if (Current_raw_info_fm_section_ref[_key_comment_depend_on_section]!==undefined) 
				{					
					var _comment_ref_input = Current_raw_info_fm_section_ref[_key_comment_depend_on_section].trim();
					if (_comment_ref_input.indexOf('#') > -1) 
					{ // case color, ...
						_comment_ref_input=_comment_ref_input.slice(1);
					}
					if (_comment_ref_input !== '') 
					{
						if (_comment !== '') {
							_comment += '<br/>';
						}
						_comment += '<strong style="color:#5BC0DE;">' + _comment_ref_input + '</strong>';
					}				
			
  			}
			}
			//--
			if (_key_comment_input_ref !== '') 
			{				
				var _comment_ref_input='';
				if (ref_modal === 'displayMeta')
				{					
					_comment_ref_input = Current_raw_info_fm_items_tree[index_current_raw_item_ref][_key_comment_input_ref].trim();
					if (_comment_ref_input.indexOf('#') > -1) 
					{ // case color, ...
						_comment_ref_input=_comment_ref_input.slice(1);
					}
					if (_comment_ref_input !== '') 
					{
						//add color information, filtering part comment input reference, ahead part
						if (fm_object[_key_comment_input_ref].form.comment !== undefined && fm_object[_key_comment_input_ref].form.comment.length > 0) 
						{
								var _ahead_ref = fm_object[_key_comment_input_ref].form.comment.trim();
								if (_comment_ref_input.indexOf(_ahead_ref) == 0) {
									var tmp = _comment_ref_input.slice(_ahead_ref.length);
									_comment_ref_input = _ahead_ref;
									_comment_ref_input += '<strong style="color:#5BC0DE;">';
									_comment_ref_input += tmp + '</strong>';
								}
						}
						if (_comment !== '') {
							_comment += '<br/>';
						}						
						_comment += _comment_ref_input;
					}					
				}
				else
				{	// case create
					if (fm_object[_key_comment_input_ref].form.comment !== undefined) 
					{
						_comment_ref_input = fm_object[_key_comment_input_ref].form.comment.trim();
					}

					var _id_input_ref_comment='#meta'+ref_modal+_key_comment_input_ref;
					activeInputRefComment(_id_input_ref_comment,'#'+_id_form,_comment_ref_input);
					
				}
			}
			//--
			if (_key_comment_depend_on_input !== '') 
			{
				if (fm_object[_key_comment_depend_on_input]!==undefined) {

					if (ref_modal === 'displayMeta') {

						var _comment_ref_input = Current_raw_info_fm_items_tree[index_current_raw_item_ref][_key_comment_depend_on_input].trim();
						if (_comment_ref_input.indexOf('#') > -1) 
						{ // case color, ...
							_comment_ref_input=_comment_ref_input.slice(1);
						}
						if (_comment_ref_input !== '') 
						{
							if (_comment !== '') {
								_comment += '<br/>';
							}						
							// _comment += _comment_ref_input;							
							_comment += '<strong style="color:#5BC0DE;">' + _comment_ref_input + '</strong>';
						}
					}
					else {
						//case create-file, create-section
						var obj = fm_object[_key_comment_depend_on_input];
	  				if (obj.form.tag==='input') 
	  				{
	  					var _comment_ref_input = 'Comment add from the Form Input : ';
	  					var test=(obj.trad_editor !== undefined && obj.trad_editor.length > 0);
	  					
	  					_comment_ref_input += '<strong style="color:#5BC0DE;">';
	  					_comment_ref_input += (test) ? obj.trad_editor : _key_comment_depend_on_input;
	  					_comment_ref_input += '</strong>';	   					
	  				}
	  				if (_comment_ref_input !== '') 
						{
							if (_comment !== '') {
								_comment += '<br/>';
							}
							_comment += _comment_ref_input;							
						}
					}  				
  			}
			}
			//--
			var _comment_html='';
	    if (_comment !== '') {
				_comment_html='<small  class="form-text text-muted">'+_comment+'</small>';
			}
			//--			
			//-- end comment
			//----------------------------------------


			var fieldDisabled_deb='';
			var fieldDisabled_fin='';	

			var _extra='';


			//----------------------------------------
			//common, add condition checked on form
			var checked_input='';
			var checked_id_ref='';
			var checked_id_alias='';
			if (fm_object[key].checked_input !== undefined) 
			{
				checked_ref = fm_object[key].checked_input;
				checked_text = fm_object[checked_ref].trad_editor;
				checked_id_ref = 'meta'+ref_modal+checked_ref;
				checked_id_alias = checked_id_ref + SufixIdCheckedInput;
				var checked_value='false';
				if (ref_modal === 'displayMeta') 
				{
					if (Current_raw_info_fm_items_tree[index_current_raw_item_ref][checked_ref] !== undefined) {
						if (Current_raw_info_fm_items_tree[index_current_raw_item_ref][checked_ref] === 'true') {
							checked_value = 'true';
						}
					}
					
				}
				else 
				{
					if (fm_object[checked_ref].form.value !== undefined) {
						if (fm_object[checked_ref].form.value === 'true') {
							checked_value = 'true';
						}					
					}
				}
				// 
				// change_min_fa_gl
				// change_min_checked_input

				checked_input = 
					'<div class="col-xs-8">'+
						'<div class="checkbox">' +
							'<label>' +
								'<input type="checkbox" id="'+checked_id_alias +'" value="'+checked_value+'" >' + checked_text +
							'</label>' +
						'</div></div>';
			}
			//----------------------------------------
	    
	    
	    //form input case
	    //----------------------------------------
	    if (_tag==='input') 
	    {
	    	var _type='text';
	    	if (hasContentsString(_form.type)) {
					_type=_form.type;
				}	

	    	//-----------------------
	    	var value_input = '';
	    	
	    	if (ref_modal === 'displayMeta') 
    		{
  				if (Current_raw_info_fm_items_tree[index_current_raw_item_ref][key] !== undefined) {
  					value_input=Current_raw_info_fm_items_tree[index_current_raw_item_ref][key];
  				} 
    		}
    		else
    		{
    			//cas create, scpecific
    			if (fm_object[key].input_from_section !== undefined && index_current_raw_section_ref > -1 ) 
					{					
						if (Current_raw_info_fm_section_ref[fm_object[key].input_from_section] !== undefined) {
							value_input=Current_raw_info_fm_section_ref[fm_object[key].input_from_section];									
						}
					}
    		}
    		if (value_input === '') 
    		{
    			if (hasContentsString(_form.value) || typeof _form.value === 'number') 
    			{
		    		//specific date, force utc date
		    		if (key.indexOf('date')==0 ) 
		    		{
		    			if(! (hasContentsString(_form.value) && _form.value.indexOf('empty')===0)) {
		    				value_input=CurrentDateTimeUtc();
		    			}
	    				
	    			}		
	    			else {
		    			value_input=_form.value;
		    		} 	    							
					}
    		}
    		// case color, ...
    		if (_type === 'color') 
    		{	//filtering ""#ffffff"
    			value_input=(value_input.indexOf('#') === 1) ? value_input.slice(1):value_input;
    		}
		    
		    //-----------------------

	    			    		
	    				    	
		    	    	
	    	var _placeholder='';
	    	if (hasContentsString(_form.placeholder)) {
					_placeholder=' placeholder="'+_form.placeholder+'"';
				}			    	

				tag_form='<form onsubmit="return false;">';
    		if (_hide_form) {
    			tag_form='<form class="u-hidden" onsubmit="return false;">';
    		}

    		
    		if (_form.max_length !== undefined && typeof _form.max_length === 'number') {
					_extra+=' maxlength="'+_form.max_length+'" ';
				}
				if (_form.min_max_value !== undefined && _form.min_max_value.length === 2) {
					_extra+=' min="'+_form.min_max_value[0]+'" max="'+_form.min_max_value[1]+'" ';
				}

				//specific date, calendar picker
				var dim_input='col-xs-10';
				var alt_field='';
				if (key.indexOf('date') === 0) 
				{					
					//integ picker
					dim_input='col-xs-6';
					//integr alternate field : date utc, with specific id
					var value_input_alt = value_input;
					value_input_alt=(value_input_alt.length>0) ? ' value="'+value_input_alt+'"':'';	

					alt_field='<input id="'+_id_form+'-alt" type="text" style="display: none !important;"'+value_input_alt+'>';

					if (value_input !=='') 
					{					
						var format_date;
						//update date displayed to user
						if (_form.value.indexOf('_fr')>-1) 
						{
		    			format_date=date_Utc2Fr(value_input);   				    		
		    		}else {
		    			//default en
		    			format_date=date_Utc2Int(value_input);
		    			 
		    		}
		    		value_input = format_date;
		    	}
	
				}

				if (_disabled_form) {					
					fieldDisabled_deb= '<fieldset disabled>';
					fieldDisabled_fin='</filedset>';
				}

				//add attr value
		    // value_input=(value_input.length>0) ? ' value="'+value_input+'"':'';			
		    if (value_input !== '') {
		    	value_input= ' value="'+value_input+'"';
		    }
		    			
				

    		//add to document
    		$(refForm$).append(	    	
		    	tag_form +
		    		'<div class="form-group row">'+
		    			'<label for="'+_id_form +'" class="col-xs-2 col-form-label">'+
		    				_titleLabel+
		    			'</label>'+
		    			checked_input+
		    			'<div class="'+dim_input+'">'+
		    				fieldDisabled_deb+
		    				'<input id="'+_id_form+'"'+
		    					'type="' +_type+'"'+ _extra +
		    					'class="form-control" '+
		    					_placeholder +
		    					value_input +'>' +
		    					alt_field +
		    					_comment_html+
		    				fieldDisabled_fin +
		    			'</div></div>'+
		    	'</form>');	

    		// activeCheckedInput
    		if (checked_input !== '') 
	    	{
	    		var _id_checked='#'+checked_id_ref;
	    		activeCheckedInput(_id_checked,'#'+_id_form);  
	    	}

	    }// ./ (_tag==='input')
	    //----------------------------------------
	    //----------------------------------------
	    else if (_tag==='select') 
	    {

	    	//"","multiple"
	    	if (hasContentsString(_form.extra)) {
					_extra+=' '+_form.extra+' ';
				}

				var value_select = '';
    		// update value textarea in display meta mode
    		if (ref_modal === 'displayMeta') 
    		{
  				if (Current_raw_info_fm_items_tree[index_current_raw_item_ref][key] !== undefined) {
  					value_select=Current_raw_info_fm_items_tree[index_current_raw_item_ref][key];
  				}
  				if (hasContentsString(value_select) &&  value_select.indexOf('[') > -1)
		    	{
		    		value_select=JSON.parse(value_select);
		    	}	  
    		}

    		var add_attr_selected = function(selected_ref,current_option){
    			var current_selected = false;
    			if (hasContentsString(selected_ref) || selected_ref === '') 
					{
						current_selected = (selected_ref === current_option) ? true:false;
					}
					else
					{
						selected_ref.forEach(function(selected, index) {
							if (selected === current_option) {
								current_selected = true;
							}
						});
					}	
					var attr_selected = (current_selected) ? ' selected="selected"': '';	

					return attr_selected;
    		};


				var _options='';
				if (fm_object[key].list_options_from_section !== undefined && index_current_raw_section_ref > -1 ) 
				{					
					if (Current_raw_info_fm_section_ref[fm_object[key].list_options_from_section] !== undefined) {
						var list = Current_raw_info_fm_section_ref[fm_object[key].list_options_from_section];

						list.split(',').forEach(function(option, index) {
							option=option.trim();
							var attr_selected = add_attr_selected(value_select,option);						

							_options=_options + 
								'<option value="'+option+'"'+ attr_selected +'>' + option + '</option>';
							});					
					}
				}
				else
				{
					if(hasContentsObj(_form.options)) 
					{
						_form.options.forEach(function(option,index,array) {

							option=option.trim();
							var attr_selected = add_attr_selected(value_select,option);	

							var text_option = option;
							if (hasContentsObj(_form.options_trad)&& _form.options_trad.length===array.length) {
								text_option = _form.options_trad[index];
							}
							_options=_options + 
								'<option value="'+option+'"'+ attr_selected +'>' + text_option + '</option>';
						});					
					}
					else if(hasContentsString(_form.options))
					{
						option=option.trim();
						var attr_selected = add_attr_selected(value_select,option);	

						var text_option = _form.options;
						if (hasContentsString(_form.options_trad)) {
							text_option = _form.options_trad;
						}
						_options=_options + 
								'<option value="'+_form.options+'"'+ attr_selected +'>' + text_option + '</option>';
					}
				}				
				
				
				//add to document
				tag_form='<div class="form-group row">';
	    	if (_hide_form) {
	    		tag_form='<div class="form-group row u-hidden">';
	    	}
	    	if (_disabled_form) 
	    	{					
					fieldDisabled_deb= '<fieldset disabled>';
					fieldDisabled_fin='</filedset>';
				}


					

    		$(refForm$).append(
		    	tag_form +
	    			'<label for="'+_id_form +'" class="col-xs-2 col-form-label">'+
	    				_titleLabel+'</label>'+
	    			'<div class="col-xs-10">'+
	    				fieldDisabled_deb +
	    				'<select id="'+_id_form+'" '+_extra+
	    					'class="form-control"' +'>'+
	    					_options+
	    				'</select>'+
	    				fieldDisabled_fin+
	    				_comment_html+			    				
		    	'</div></div>');

    		if (_key_depend_on !== '') 
    		{
    			// add event on change selected value of depend_on form
    			var _id_depend_on='#meta'+ref_modal+_key_depend_on;
    			var _id_ref_depend_on='#meta'+ref_modal+key;

    			if ( _extra_depend_on === 'text' )
					{						
						//event hide or not image, hide when type-timeline with selected value = 'text'
						setTimeout(function() {
							$(_id_depend_on).change(
								{
									id_ref: _id_ref_depend_on,
									// key_image:  key,
									// default_image: default_image,									
									ref_modal: ref_modal
								},
								hiddenFormTypeSelect);						
						}, 500);
						//update on current
						if (_value_depend_on === 'text')
						{
							$(_id_ref_depend_on).parents('.form-group').addClass('u-hidden');

						}	
					}		
    		}


    	}// ./ (_tag==='select')
    	//----------------------------------------
    	//----------------------------------------
    	else if (_tag==='textarea') 
    	{

    		var _rows=3;
    		if (_form.rows !== undefined) {
					_rows=_form.rows;
				}

				
	    	if (_form.max_length !== undefined && typeof _form.max_length === 'number') {
					_extra+=' maxlength="'+_form.max_length+'" ';
				}
				
				//add to document
				tag_form='<div class="form-group row">';
    		if (_hide_form) {
    			tag_form='<div class="form-group row u-hidden">';
    		}

    		var value_textarea = '';
    		// update value textarea in display meta mode
    		if (ref_modal === 'displayMeta') 
  			{
  				var value_key = '';
  				if (Current_raw_info_fm_items_tree[index_current_raw_item_ref][key] !== undefined) {
  					value_key=Current_raw_info_fm_items_tree[index_current_raw_item_ref][key];
  				}
  				var val_split = value_key.split('<br/>');
  				value_key='';
  				val_split.forEach(function(line, index) {
		    		if (index>0) {
		    			value_key+='\n';
		    		}
		    		value_key+=line;
					});				
					value_textarea = value_key;
				}

    		$(refForm$).append(
		    	tag_form +
	    			'<label for="'+_id_form +'" class="col-xs-2 col-form-label">'+
	    				_titleLabel+'</label>'+
	    			'<div class="col-xs-10">'+
	    				'<textarea id="'+_id_form+'" ' + _extra +
	    					'class="form-control" ' +
	    					'rows="'+_rows +'" '+ '>'+	
	    					value_textarea +			    					
	    				'</textarea>'+
	    				_comment_html+			    				
		    	'</div></div>');

    		
    	}
    	//----------------------------------------
    	//----------------------------------------
    	else if (_tag==='image' ) 
    	{
    		//gestion comment : tab global : currentCommentImage_gl, used in fn updateImageFmEditor
    		currentCommentImage_gl[key] = _comment; 		
    		currentLabelMdImage_gl[key] = _titleLabel;
    		currentCheckedImage_gl[key] = checked_input;
    		currentCheckedId_gl[key] = '#'+checked_id_ref;    		
  		
  			var value_key=_form.value;  
  			var default_image=_form.value;   		

    		var is_jpg = true;
    		var hidden_form_image = false;

    		if (ref_modal === 'displayMeta') 
  			{
  				if (Current_raw_info_fm_items_tree[index_current_raw_item_ref][key] !== undefined) 
  				{
  					value_key=Current_raw_info_fm_items_tree[index_current_raw_item_ref][key];
  					if (value_key.indexOf('fa-') !== 0){
  						default_image=value_key;
  					}  										
  				}
  			}    			
  			
    		if (_key_depend_on !== '') 
    		{
    			// add event on change selected value of depend_on form
    			var _id_depend_on='#meta'+ref_modal+_key_depend_on;
    			var _id_ref_depend_on='#meta'+ref_modal+key;
    			var _id_update_fa='#'+ref_modal+' .actions .updateFa';    				    			    			

    			if ( _extra_depend_on === 'font-awesome' )
    			{
    				change_min_image_gl = '';	
    				change_min_fa_gl = '';
	    			//event change type-miniature select
						setTimeout(function() {
							$(_id_depend_on).change(
								{
									id_ref: _id_ref_depend_on,
									key_image:  key,
									default_image: default_image,									
									ref_modal: ref_modal
								},
								changeTypeImageIconDependOn);						
						}, 500);	
						//event onclick update font-awesome
						setTimeout(function() {
							$(_id_update_fa).click(
								{
									id_ref: _id_ref_depend_on,									
									ref_modal: ref_modal,
									key_image: key							
								},
								updateFaIconDisplay);						
						}, 500);
						if (_value_depend_on === 'font-awesome') 
		    		{
		    			var fa_prefix=value_key.indexOf('fa-');
		    			var fa_name=fa_default;//default, first list
		    			if (fa_prefix > -1) {
		    				fa_name = value_key.slice(fa_prefix);
		    			}
		    			is_jpg=false;
		    			//comment force on function
		    			updateFontAwesomeFmEditor(fa_name,ref_modal,key,function() {}); 
		    		}
					}// end test (_extra_depend_on === 'font-awesome')

					if ( _extra_depend_on === 'text' )
					{						
						//event hide or not image, hide when type-timeline with selected value = 'text'
						setTimeout(function() {
							$(_id_depend_on).change(
								{
									// id_ref: _id_ref_depend_on,
									key_image:  key,
									// default_image: default_image,									
									ref_modal: ref_modal
								},
								hiddenFormTypeImage);						
						}, 500);

						//update on current
						if (_value_depend_on === 'text')
						{
							
							setTimeout(function() {
								var class_image = ' .' + PrefClassMdImageModal + key;
								var ref_temp='#'+ref_modal+' .modal-body .image-form ';
								ref_temp += class_image;
								$(ref_temp).addClass('u-hidden');
							}, 500);

							//update on current
							if (_value_depend_on === 'text')
							{
								hidden_form_image=true;

							}	
						}	

					}											

    		}// end test (_key_depend_on !== '') 
    		
    		if (is_jpg==true) {    			
    			
    			updateImageFmEditor(value_key,ref_modal,key,hidden_form_image,function() {});
    		}
	    	
    		 
    	}// ./ (_tag==='image')
    	
	    	
	   }// ./ Display form	 
			    
	});// ./each key meta
}

function hiddenFormTypeSelect(event) {
	var optionSelected = $(this).find("option:selected");
	var valueSelected  = optionSelected.val();
	// var value_ref='';
	// var update_value_ref='';
	// //
	var id_ref = event.data.id_ref;
	// var class_image = ' .' + PrefClassMdImageModal + event.data.key_image;
	// var ref$='#'+event.data.ref_modal+' .modal-body .image-form ';
	// ref$ += class_image;

	if (valueSelected === 'text') 
	{
		// $(id_ref).addClass('u-hidden');
		$(id_ref).parents('.form-group').addClass('u-hidden');
	}
	else
	{
		// $(id_ref).removeClass('u-hidden');
		$(id_ref).parents('.form-group').removeClass('u-hidden');
	}
}

function hiddenFormTypeImage(event) {
	var optionSelected = $(this).find("option:selected");
	var valueSelected  = optionSelected.val();
	// var value_ref='';
	// var update_value_ref='';
	// //
	// var id_ref = event.data.id_ref;
	var class_image = ' .' + PrefClassMdImageModal + event.data.key_image;
	var ref$='#'+event.data.ref_modal+' .modal-body .image-form ';
	ref$ += class_image;

	if (valueSelected === 'text') 
	{
		$(ref$).addClass('u-hidden');
	}
	else
	{
		$(ref$).removeClass('u-hidden');
	}
}


function changeTypeImageIconDependOn(event) {
	var optionSelected = $(this).find("option:selected");
	var valueSelected  = optionSelected.val();
	var value_ref='';
	var update_value_ref='';
	//
	var id_ref = event.data.id_ref;
	var key_image = event.data.key_image;


	if ($(id_ref).prop('value') !== undefined) {
		value_ref=$(id_ref).prop('value').trim();	  
	}

	if (valueSelected === 'font-awesome') {
		
		if (value_ref.indexOf('fa-') === 0) {
			update_value_ref = value_ref.slice(value_ref.indexOf('fa-'));
		}
		else {
			change_min_image_gl = value_ref;

			if (change_min_fa_gl !== '') {
				update_value_ref = change_min_fa_gl;
			}
			else {
				update_value_ref = fa_default;
			}
			
		}
		$(id_ref).prop('value',update_value_ref);
		updateFontAwesomeFmEditor(update_value_ref,event.data.ref_modal,key_image,function() {});

		var ref_update = '#'+event.data.ref_modal+' .actions .updateFa';
		setTimeout(function() {
			$(ref_update).click(
				{
					id_ref: id_ref,
					ref_modal: event.data.ref_modal,
					key_image: key_image
				},
				updateFaIconDisplay);						
		}, 200);
	}
	else
	{
		//default image type jpg
		if (value_ref.indexOf('fa-') === 0) {

			change_min_fa_gl = value_ref;

			update_value_ref = event.data.default_image;
			if (change_min_image_gl!=='') {
				update_value_ref = change_min_image_gl;
			}
			
			$(id_ref).prop('value',update_value_ref);
			updateImageFmEditor(update_value_ref,event.data.ref_modal,key_image,false,function() {});
		}

	}
}


function updateFaIconDisplay(event) {

	var id_ref = event.data.id_ref;
	var key_image = event.data.key_image;
	var value_ref='';

	if ($(id_ref).prop('value') !== undefined) {
		value_ref=$(id_ref).prop('value').trim();	  
	}

	if (value_ref.indexOf('fa-') === 0) {
		updateFontAwesomeFmEditor(value_ref,event.data.ref_modal,key_image,function() {});

		setTimeout(function() {
			var ref_update = '#'+event.data.ref_modal+' .actions .updateFa';
			$(ref_update).click(
				{
					id_ref: id_ref,					
					ref_modal: event.data.ref_modal,
					key_image: key_image							
				},
				updateFaIconDisplay);						
		}, 200);
	}
}



function activeInputRefComment(id_ref_input,id_form,comment_ref)
{
	var value_input_ref = '';

	var value_form = $(id_form).prop('value');	
	if ( value_form !== undefined) {		
		value_input_ref=comment_ref+' '+value_form.trim();		
	}

	$(id_ref_input).prop('value',value_input_ref) ;	

	setTimeout(function() {
		$(id_form).on('input',
			{
				id_ref_input: id_ref_input,
				id_form: id_form,
				comment_ref: comment_ref
			},
			updateInputRefComment);						
	}, 500);
	    	
}

function updateInputRefComment(event) {

	var id_ref_input = event.data.id_ref_input;
	var id_form = event.data.id_form;
	var comment_ref = event.data.comment_ref;

	var value_input_ref = '';

	var value_form = $(id_form).prop('value');	
	if ( value_form !== undefined) {
		value_input_ref=comment_ref+' '+value_form.trim();		
	}

	$(id_ref_input).prop('value',value_input_ref) ;		
}





//+++++++++++++++++++++++++++++
//interface Create files,   +++
//+++++++++++++++++++++++++++++
$('#ListActionsAside .create-item').on('click', function () {

	$('#createItem .modal-body .all-forms').empty();
	$('#createItem .modal-body .image-form').empty();
	$('#createItem .modal-footer').html('<button type="button" class="btn btn-success " disabled><i class="fa fa-ban"></i></button>');

	Current_info_fm_item={};
	Current_raw_info_fm_item={};//needed in displayFormFmEditor() condition to display  image default value at creation

	var ref_modal = 'createItem';

	//create new object, force to avoid conflict when manipulate the object, todo, coreection
	ModelsFmItemFilter = $.extend(true, {}, ModelsFmItemFilterRef);
	Current_info_fm_item=extractMetadataFromModel(ModelsFmItemFilter,CurrentPath);

	if(hasContentsObj(Current_info_fm_item)) {

		displayFormFmEditor(Current_info_fm_item,ref_modal); 

		// Post-traitement:
		// update specific metadata value 
		Object.keys(Current_info_fm_item).forEach(function(key,index) {

			var _id_form='#meta'+ref_modal+key;
			
			//specific type_editor type select, force value at kceditor if currentpath define in config FoldersModelKcEditor
			// ["MdEditor","CkEditor(Word)"],
			if (key==='type_editor' && index_current_raw_section_ref > -1) 
			{				
				if (Current_raw_info_fm_section_ref["type_child_editor"] !== undefined) 
				{
					if (Current_raw_info_fm_section_ref["type_child_editor"] === 'CkEditor(Word)') 
					{
						$(_id_form).val("CkEditor(Word)");	
					}
				}
				else 
				{	// old using FoldersModelKcEditor in config.js, todo merge with config project
					var activeKCE=false;
					FoldersModelKcEditor.forEach(function(path_kce) {
						var update_output = filter_current_path_with_model(CurrentPath, path_kce);
						if (update_output) {					
							activeKCE=true;
						}
					});
					if (activeKCE) {
						$(_id_form).val("CkEditor(Word)");	
					}
				}				    	    	
			}
			//---			

		});


		$('#createItem #metacreateItemtitle').on('input', function(){
			if($(this).val().length === 0){
				$('#createItem .modal-footer').html('<button type="button" class="btn btn-success " disabled><i class="fa fa-ban"></i></button>');
			}else if($(this).val().length > 0) {
				$('#createItem .modal-footer').html('<button type="button" class="create btn btn-success "><i class="fa fa-check"></i> Create</button>');
			}
		});
	
	}
	else {
		$('#createItem .modal-body .all-forms').append(
			'<p> Cant create file on these section. Please contact your administrator</p>');
	}	

});

//option to change the image, interraction with MdImage module
$(document).on('click', '#createItem .actions .changeImage', function(){
	
	CallerMdImageModal='createItem';

	//det current key, KeyMdImageModal, on parents, search div_key	
	// used when select a new image : see $('body').on('click', '#MdImage .card .card-block > .select_mdimage', function(){	
	KeyMdImageModal='';
	var that = $(this);	
	var max_length=0;
	Object.keys(currentCommentImage_gl).forEach(function(key,index) {
		var class_tmp = '.' + PrefClassMdImageModal + key;
		var current_length = that.parents(class_tmp).length
		if ( current_length > max_length)
		{
			KeyMdImageModal = key;
			max_length = current_length;
		}
	});


	$('#createItem').modal('toggle');
	$('#MdImage').modal('toggle');
	
	var path_image_tmp=PathImageRef;
	if (CurrentPathImage!=='') {
		path_image_tmp+='/'+CurrentPathImage;
	}
	MdImage_select(path_image_tmp);
});



//create a new file of type .md after edition
$('body').on('click', '#createItem .modal-footer .create', function () {
	
	ModifiedFilename='';
	ModifiedContent='';
	var _id_form;
	var value_key;
	var line_meta;

	$('.loading, .noclick').toggle();
	$('#createItem').modal('toggle');
	
	ModifiedContent=fmUpdatedFromEditor(Current_info_fm_item,'createItem');
	//note ModifiedFilename upated in fmUpdatedFromEditor

	var prom=new Promise(function(resolve, reject) {		
		var _path=CurrentPath;
		if (_path!=='') {
			_path+='/';
		}
		//modifjanv17 :
		if (_path==='_posts/') {
			_path+=moment().format("Y-MM-DD")+'-';
		}

		ModifiedFilename=_path+ModifiedFilename;
		ShaFolder(ModifiedFilename, Git_refs_heads, function(data) {
			if (data!==undefined) {
				//fichier with this filename exist
				//add unix timestamp
				var new_ext='-'+moment().format('x')+'.md';
				ModifiedFilename=ModifiedFilename.replace(/\.md$/,new_ext);
			}			
			resolve();
		});		
	});
	//and then create new file
	prom.then(function(){

		var commit_msg = commitMsgModifyCreateMd(ModifiedFilename,'create');
		UpdateCreateOneFile(ModifiedFilename, Git_refs_heads, ModifiedContent, "utf-8", commit_msg, function(data) {
			UpdateLocalRepo();				
			OpenSection(CurrentName, CurrentPath);			
			$('.loading, .noclick').toggle();
		});
	});
	
});

$('#createItem').on('hidden.bs.modal', function () { //Clear values on modal close 
});
//+++++++++++++++++++++++++++++
//interface Create files    +++
//+++++++++++++++++++++++++++++


//+++++++++++++++++++++++++++++
//interface Create sections +++
//+++++++++++++++++++++++++++++
$('#ListActionsAside .createsection').on('click', function () {

	$('#createSection .modal-body .all-forms').empty();
	$('#createSection .modal-body .image-form').empty();
	$('#createSection .modal-footer').html('<button type="button" class="btn btn-success " disabled><i class="fa fa-ban"></i></button>');

	Current_info_fm_item={};
	Current_raw_info_fm_item={};//needed in displayFormFmEditor() condition to display  image default value at creation

	//create new object, force to avoid conflict when manipulate the object, todo, coreection
	ModelsFmSectionFilter = $.extend(true, {}, ModelsFmSectionFilterRef);
	Current_info_fm_item=extractMetadataFromModel(ModelsFmSectionFilter,CurrentPath);

	var ref_modal = 'createSection';

	if(hasContentsObj(Current_info_fm_item)) {

		displayFormFmEditor(Current_info_fm_item,ref_modal);
		

		$('#createSection #metacreateSectiontitle').on('input', function(){
			if($(this).val().length === 0){
				$('#createSection .modal-footer').html('<button type="button" class="btn btn-success " disabled><i class="fa fa-ban"></i></button>');
			}else if($(this).val().length > 0) {
				$('#createSection .modal-footer').html('<button type="button" class="create btn btn-success "><i class="fa fa-check"></i> Create</button>');
			}
		});
	}
	else {
		$('#createSection .modal-body .all-forms').append(
			'<p> Cant create a new section. Please contact your administrator</p>');
	}	

});


//option to change the image, interraction with MdImage module
$(document).on('click', '#createSection .actions .changeImage', function(){
	
	CallerMdImageModal='createSection';

	//det current key, KeyMdImageModal, on parents, search div_key	
	// used when select new image : see $('body').on('click', '#MdImage .card .card-block > .select_mdimage', function(){	
	KeyMdImageModal='';
	var that = $(this);	
	var max_length=0;
	Object.keys(currentCommentImage_gl).forEach(function(key,index) {
		var class_tmp = '.' + PrefClassMdImageModal + key;
		var current_length = that.parents(class_tmp).length
		if ( current_length > max_length)
		{
			KeyMdImageModal = key;
			max_length = current_length;
		}
	});

	$('#createSection').modal('toggle');
	$('#MdImage').modal('toggle');
	
	var path_image_tmp=PathImageRef;
	if (CurrentPathImage!=='') {
		path_image_tmp+='/'+CurrentPathImage;
	}
	MdImage_select(path_image_tmp);
});




//create a new section, form new_section/index.md  with fm in idnex.md after edition; these file is filtered in browser
$('body').on('click', '#createSection .modal-footer .create', function () {
	
	ModifiedFilename='';
	ModifiedContent='';
	var _id_form;	

	$('.loading, .noclick').toggle();
	$('#createSection').modal('toggle');
	
	ModifiedContent=fmUpdatedFromEditor(Current_info_fm_item,'createSection');	
	//note ModifiedFilename upated in fmUpdatedFromEditor

	var match_md = ModifiedFilename.match(/\.md$/);
	if ( match_md !== null) {
		ModifiedFilename = ModifiedFilename.substr(0,match_md.index);			
	}
	Filename_ext_timestamp = '-'+moment().format('x');	
	PageFilename = ModifiedFilename;

	var isSectionPage = returnValue_extractPathsModelFm_KeyValue(PathsFmSectionsWithFileActions, CurrentPath);
	
	//todo : optim fn case
	// add default content section coll_ext, empty if create new page
	if (!(isSectionPage === 'add_page'))
	{	ModifiedContent=ModifiedContent+'\n'+section_include_content+'\n';}

	//promises
	var promCreateIndex,promCreatePage,promCreateNavigation,promCreateHeaderSlider;

	promCreateIndex=new Promise(
		function(resolve, reject) 
		{		
			var _path=CurrentPath;
			if (_path!==''){_path+='/';}
			ModifiedFilename = _path+ModifiedFilename;

			ShaFolder(ModifiedFilename, Git_refs_heads, function(data) {		
				if (data!==undefined) {
					//section with this filename exist, add unix timestamp		
					ModifiedFilename+=Filename_ext_timestamp;
				}	
				var _path_section = ModifiedFilename;
				ModifiedFilename  += '/index.md';//final path
				//create new section with attach file index.md
				octoRepo.contents(encodeURI(ModifiedFilename)).add({ message: 'add section '+_path_section, content: '', branch: Git_refs_heads}).
				then(function(data){
					// get the current commit id of refs heads
					CurrentRefsHeadsCommitSha=data.commit.sha;				
					resolve();
				});	 			
			});		
		}
	);

	//extra, create page : create file  on _pages folder with meta layout and permalink
	promCreateIndex.then(function ()
	{
		if (isSectionPage === 'add_page') 
		{
			//add header-slider subsection on creation
			var add_header_slider = extractPageMetaTestValueKey(PageSectionRef.config_header.key_slider_meta, PageSectionRef.config_header.value_slider_meta)
			if (add_header_slider) 
			{
				promCreateHeaderSlider = new Promise(addHeaderSliderSubsectionPageSection);

			} else {
				promCreateHeaderSlider = new Promise(function(resolve){resolve();});
			}
			
			promCreateHeaderSlider.then(function(){ 

				promCreateNavigation = new Promise(addNavigationPageSection);

				promCreateNavigation.then(function(){

					promCreatePage = new Promise(addPageSection);

					//and then update index.md linked to the new section with fm info
					promCreatePage.then(updateIndexSectionAndDisplay);

				});
			});
		
		}
		else
		{
			// promCreatePage = new Promise(function(resolve){resolve();});
			// //and then update index.md linked to the new section with fm info
			// promCreatePage.then(updateIndexSectionAndDisplay);
			updateIndexSectionAndDisplay();
		}		
		
	});

});


function updateIndexSectionAndDisplay ()
{
	var commit_msg = commitMsgModifyCreateMd(ModifiedFilename,'create');
	UpdateCreateOneFile(ModifiedFilename, Git_refs_heads, ModifiedContent, "utf-8", commit_msg, function(data) {
		UpdateLocalRepo();	
		OpenSection(CurrentName, CurrentPath);		
		$('.loading, .noclick').toggle();
	});
}

function addPageSection (resolve, reject) {			
	//front matter created page :	
	var key,value_key,line_meta;
	var fm_page='---\n';
	PageSectionRef.list_meta_page.forEach(function(meta_info) 
	{
		key = meta_info.id;
		value_key=extractPageMetaValueKey(meta_info);		
		line_meta=key+' : '+value_key;
		fm_page+=line_meta+'\n';
	});
	// close fm
	fm_page=fm_page+'---\n';

	var PageFilename_path = PageSectionRef.config.path+'/'+PageFilename+'.md';
	ShaFolder(PageFilename_path, Git_refs_heads, function(data) {
		if (data!==undefined || PageFilename === PageSectionRef.config.root_name) {
			//add unix timestamp
			PageFilename_path=PageFilename_path.replace(/\.md$/,Filename_ext_timestamp);
		}
		var commit_msg = commitMsgModifyCreateMd(PageFilename_path,'create');
		UpdateCreateOneFile(PageFilename_path, Git_refs_heads, fm_page, "utf-8", commit_msg, function(data) {
			UpdateLocalRepo();	
			resolve();			
		});
	});
}


function addNavigationPageSection (resolve, reject) {			
	//front matter created page :
	var fm_navigation='---\n';
	var key,value_key,line_meta;

	var info_fm_navigation={};
	ModelsFmItemFilter = $.extend(true, {}, ModelsFmItemFilterRef);
	info_fm_navigation = extractMetadataFromModel(ModelsFmItemFilter,PageSectionRef.config.path_navigation);

	Object.keys(info_fm_navigation).forEach(function(key_ref,index) 
	{
		value_key='';
		PageSectionRef.list_meta_navigation.forEach(function(meta_info) 
		{
			if (meta_info.id === key_ref) 
			{
				value_key=extractPageMetaValueKey(meta_info);
				return false;
			}
		});
		line_meta=key_ref+' : '+value_key;		
		fm_navigation+=line_meta+'\n';
	});

	
	// close fm
	fm_navigation=fm_navigation+'---\n';

	var PageNavigFilename_path = PageSectionRef.config.path_navigation+'/'+PageFilename+'.md';
	ShaFolder(PageNavigFilename_path, Git_refs_heads, function(data) {
		if (data!==undefined || PageFilename === PageSectionRef.config.root_name) {
			//add unix timestamp
			PageNavigFilename_path=PageNavigFilename_path.replace(/\.md$/,Filename_ext_timestamp);
		}
		var commit_msg = commitMsgModifyCreateMd(PageNavigFilename_path,'create');
		UpdateCreateOneFile(PageNavigFilename_path, Git_refs_heads, fm_navigation, "utf-8", commit_msg, function(data) {
			UpdateLocalRepo();	
			resolve();			
		});
	});

}

function addHeaderSliderSubsectionPageSection (resolve, reject) {			
	//front matter created page :
	var fm_headerslider='---\n';
	var key,value_key,line_meta;

	var info_fm_headerslider={};
	ModelsFmSectionFilter = $.extend(true, {}, ModelsFmSectionFilterRef);
	info_fm_headerslider = extractMetadataFromModel(ModelsFmSectionFilter,PageSectionRef.config_header.path_header_slider);
	
	Object.keys(info_fm_headerslider).forEach(function(key_ref,index) 
	{
		value_key='';
		PageSectionRef.list_meta_header_slider.forEach(function(meta_info) 
		{
			if (meta_info.id === key_ref) 
			{
				value_key=extractPageMetaValueKey(meta_info);
				return false;
			}
		});
		line_meta=key_ref+' : '+value_key;		
		fm_headerslider+=line_meta+'\n';
	});
	
	// close fm
	fm_headerslider=fm_headerslider+'---\n';

	//path new subsection
	var new_path = PageSectionRef.config_header.path_header_slider.substring(PageSectionRef.config_header.path_header_slider.lastIndexOf('/'));
	var path_subsection = ModifiedFilename.replace(/\/index\.md$/,new_path);
	var path_index_subsection = path_subsection + '/index.md';

	ShaFolder(path_subsection, Git_refs_heads, function(data) {

		octoRepo.contents(encodeURI(path_index_subsection)).add({ message: 'add subsection '+path_subsection, content: '', branch: Git_refs_heads}).
		then(function(data){
			// get the current commit id of refs heads
			CurrentRefsHeadsCommitSha=data.commit.sha;				
			// resolve();
			var commit_msg = commitMsgModifyCreateMd(path_index_subsection,'create');
			UpdateCreateOneFile(path_index_subsection, Git_refs_heads, fm_headerslider, "utf-8", commit_msg, function(data) {
				UpdateLocalRepo();	
				resolve();			
			});
		});	 

		
	});
}

function extractPageMetaValueKey(meta_info) {
	var value='';
	if (meta_info.origin === 'custom_value') 
	{
		value = meta_info.value;
	}
	else if (meta_info.origin === 'custom_link') 
	{
		value = '/'+PageFilename+'/'+PageSectionRef.config.permalink_ext;
	}
	else if (meta_info.origin === 'index_section') 
	{
		var regex_meta = new RegExp('\\n'+meta_info.id+'\\s*:\\s*.*\\n');
		// ModifiedContent : fm file section index.md added
		if (ModifiedContent.search(regex_meta) > -1)
		{
			var corresp = regex_meta.exec(ModifiedContent);
			value = corresp[0].substring(corresp[0].indexOf(':')+1).trim();
		}		
	}
	return value;
}

function extractPageMetaTestValueKey(_key, value_to_compare)
{
	var value='';
	var regex_meta = new RegExp('\\n'+_key+'\\s*:\\s*.*\\n');
	// ModifiedContent : fm file section index.md added
	if (ModifiedContent.search(regex_meta) > -1)
	{
		var corresp = regex_meta.exec(ModifiedContent);
		value = corresp[0].substring(corresp[0].indexOf(':')+1).trim();
	}		

	return value===value_to_compare
}


$('#createSection').on('hidden.bs.modal', function () { //Clear values on modal close
});
//+++++++++++++++++++++++++++++
//interface Create sections +++
//+++++++++++++++++++++++++++++



//++++++++++++++++++++++++++
//interface Upload files +++
//++++++++++++++++++++++++++
Dropzone.options.addFromFolder = { //Disable image resize
	thumbnailWidth: null,
	thumbnailHeight: null,
	init: function() {
		this.on("thumbnail", function(file, dataUrl) {
			$('img[alt="' + file.name + '"]').parent().next().append('<div class="dz-remove"><i class="fa fa-times-circle"></i> Remove</div>');
		});
	}
};
Dropzone.options.MdUploader = { //Disable image resize
	thumbnailWidth: null,
	thumbnailHeight: null,
	init: function() {
		this.on("thumbnail", function(file, dataUrl) {
			$('img[alt="' + file.name + '"]').parent().next().append('<div class="dz-remove"><i class="fa fa-times-circle"></i> Remove</div>');
		});
	}
};
Dropzone.prototype.submitRequest = function(xhr, formData, files) { //Disable auto-uploads
};

$('.upload').on('click', function () {	
});


$('body').on('click', '#uploadImage .uploader .btn-success', function(){
	var _filesToUpload = ($('#uploadImage .addimage-drop img').length);
	var _augmentIn = 100 / _filesToUpload;
	var _currentName = CurrentName;
	
		
	if (_filesToUpload === 0) {
	  alert('There are no images to upload');
	}else {
		$('.upload').prop('disabled', true);
		$('#uploadImage, #Uploading').modal('toggle');
		
		
		var path_image_tmp=PathImageRef;
		if (CurrentPathImage !== '') {
			path_image_tmp+='/'+CurrentPathImage;
		}
		UploadDropImages(path_image_tmp, '#uploadImage .addimage-drop img', '#Uploading',_augmentIn, function() {
			UpdateLocalRepo();	
			if(_currentName === CurrentName){
				if($('body').attr('data-content') === 'dir'){
					OpenSection(CurrentName, CurrentPath);
				}				
				else{
					Root();
				}
			}
					
			$('#UploadSuccess').modal('toggle');
			
		});
	}
});


$('#uploadImage').on('hidden.bs.modal', function () {
	$('#uploadImage form.addimage-drop .dz-preview').remove();
	// $('#uploadImage #filename').val('');
});
$('#Uploading button').click(function(){
	$('#Uploading .noclick').toggle();
	$('#Uploading').toggleClass('minimized');
	$('#Uploading button i').toggleClass('fa-minus').toggleClass('fa-plus');
});

$('#UploadSuccess button').click(function(){
	$('#Uploading').modal('toggle');
	$('.upload').prop('disabled', false);
	$('#uploadImage form.addimage-drop .dz-preview').remove();
	// $('#uploadImage #filename').val('');
	$('#uploadImage form.addimage-drop').removeClass('dz-started');
	$('#Uploading .progress').attr('value', '0');
	$('#Uploading .percent').text('0');
	$('#uploadImage input').val('');
});
//++++++++++++++++++++++++++
//interface Upload files +++
//++++++++++++++++++++++++++


//++++++++++++++++++++++++++++++
//interface Update site prod +++
//++++++++++++++++++++++++++++++

$('#ListActionsAside .updatesite').on('click', function () {

	$('#updateSite .files').empty();
	var prom=new Promise(function(resolve, reject) {		
		
		GetDateSinceUpdateOnMaster(function(_date) {

			GetCommitsSince(_date,function(data) {
				var detect_ref_sha = false;
				data.forEach(function(commit, index, array) {
					if(commit.sha===CurrentRefsHeadsMasterCommitSha) 
					{						
						detect_ref_sha=true;
						resolve();
					}	
					else 
					{
						$('#updateSite .files').append(
							'<a href="'+commit.html_url+'" target="_blank" class="list-group-item">'+commit.commit.message+'</a>');
					}
					//-------------
					// last index, size max list commits = 30
					//-------------
					if (!detect_ref_sha && (index === (array.length-1)))
					{
						resolve();
					}			
				});
				
			});
		})
		
	});
	//and then update 
	prom.then(function(){
		
		$('#updateSite .modal-footer').html(
			'<button type="button" class="cancel btn btn-danger "><i class="fa fa-check"></i> Delete&nbsp;Update</button>' +
			'<button type="button" class="merge btn btn-success "><i class="fa fa-check"></i> Merge&nbsp;Update</button>');
		return;
	});		

});

$('body').on('click', '#updateSite .modal-footer .merge', function () {
	
	// $('.loading, .noclick').toggle();
	$('.noclick').toggle();
	document.getElementById('spinner-git-update').classList.remove("u-hidden");

	//if pull exist !! , bug octokat.js:848 POST https://api.github.com/repos/id2m/peb01/pulls 422 (Unprocessable Entity)
	// update site master branch		
	octoRepo.pulls.create({"base":Git_refs_heads_master,"head":Git_refs_heads,"title": "UpdateSite","body": "pull_this",})
	.then(function(pull_request)
	{			
  	return	octoRepo.pulls(pull_request.number).merge.add({commitMessage: 'optional message'});
  })
	.then(function(val) 
	{
		console.log(val);
		return octoRepo.git.refs.heads(Git_refs_heads).remove();
	})
	.done( function(val) 
	{
		console.log('todo, remove Git_refs_heads val:'+val);
		console.log('update production site, please wait..');
		UpdateGhPagesRepo();
		// reply, message 'git_production_ready'
	});			

});


$('body').on('click', '#updateSite .modal-footer .cancel', function () {

	$('#confirmCancelUpdate').modal('toggle');	
});


$(document).on('click', '#confirmCancelUpdate #Confirm', function(){

	var checked_forceclone=true; //  document.getElementById('ReinitForceClone').checked;

	// $('.loading, .noclick').toggle();
	$('.noclick').toggle();
	document.getElementById('spinner-git-cancel').classList.remove("u-hidden");
	
	octoRepo.git.refs.heads(Git_refs_heads).remove().then(
		function(val) {
			if(val===true) 
			{
				console.log('todo, remove Git_refs_heads val:'+val)
				console.log('reinit git config, please wait...');
				//
				if (checked_forceclone) 
				{
					ReinitForceCloneLocalRepo();
				}else {
					ReinitLocalRepo();
				}
				// reply, message 'git_repo_ready'		
			} 
		}
	);	
});

$('#CancelUpdateSuccess button').click(function(){
	$('#updateSite').modal('toggle');
});

//++++++++++++++++++++++++++++++
//interface Update site prod +++
//++++++++++++++++++++++++++++++






//todo:
// - when delete a md possible to delete images, if differente default one
// - redim image lors ajout
// - date publication  add button update to current date if date publication < current date

//when create section, create folder images if needed

//editor fm, add buttons restore enregistred value
// note :
//si ajout nouvel meta fm on ModelsFmItemFilter, pris en compte dans billet existant, 
//1er update -> param avec valeur par défaut renseigne dans tab confug
// bug editor content si modif taille ecran, a voir sur tablet mobile...


//editor md
// test img
// <img style="float:left;" width="50%"   src="https://raw.githubusercontent.com/id2m/peb01/master/images/_originals/CliffsByBjzaba-1472427750477.png?token=AT5UuEA8IYmBAm6ocV3xELo2PaAnn4_pks5Xw7U7wA%3D%3D" /> <span>Sed eros mauris, aliquet ac feugiat sed, lobortis et erat. Nunc faucibus enim nibh, quis tempus sapien pulvinar vel. Aenean id imperdiet purus. Cras luctus egestas turpis eu pharetra. </span>

// color delete github cb2431