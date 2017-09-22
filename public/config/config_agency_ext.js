//Place here your personal Access Token, you can go to our Readme if you need help
var AccessToken = 'your_pers_access_token';// !! not commit
var Git_email = 'your_git_email@gmail.com';
var Git_repoName = 'agency_ext';
var base_url='/agency_ext';
var PathImageRef='images';
//end common part server.js custom client

var Default_lang = 'en'; // option available: 'en','fr'
var PathImagePictOriginals='_originals';
// mode image : [baseurl, picture_originals, direct_url]
var DefaultModeImage = "picture_originals";
// on ModelsFmItemFilterRef, 
// "folderTree":"_agency/site-config/background-images",
// "customModeImage": "baseurl",

//not used, see clean_blog-ext
var PageSectionRef = 
{    
    "config":    
    {
        "path": "_pages",
        "root_name": "home",
        "permalink_ext" : "index.html",
        "path_navigation": "",       
    },
    "config_header":    
    {        
        "key_slider_meta": "header_page",
        "value_slider_meta": "default_slider",
        "path_header_slider": ""        
    },
    "list_meta_page" : 
    [
        {
            "id" : "layout",
            "origin": "custom_value",
            "value": "page-clean_blog"         
        },        
        {
            "id" : "permalink",
            "origin": "custom_link"
        }

    ], 
    "list_meta_navigation" : 
    [
        {
            "id" : "title",
            "origin": "index_section"            
        }
    ],
    "list_meta_header_slider" : 
    [
        {
            "id" : "title",
            "origin": "custom_value",
            "value": "Header slider"           
        }
    ]   
   
};



var TreeRootFilter={ 
"list" : 
[    
    {"folderTree":"_agency/home-page-sections",
    "titleOnTree":"Sections Home page",
    "pathImgTree":"home-page-sections",
    "filter_mode_admin":false
    },
    {"folderTree":"_detailed-contents/detailed-contents",
    "titleOnTree":"Detailed Contents",
    "pathImgTree":"detailed-contents",
    "filter_mode_admin":false
    },
    {"folderTree":"_agency/site-config",
     "titleOnTree":"Site configuration",
     "pathImgTree":"site-config",
     "filter_mode_admin":true
    },       
    {"folderTree":"images/_originals",
    "titleOnTree":"Images - Site",
    "pathImgTree":"",
    "filter_mode_admin":true
    },
    {"folderTree":"images/site-config",
    "titleOnTree":"Images - Configuration",
    "pathImgTree":"site-config",
    "filter_mode_admin":true
    }
]
};//todo; si erreur sur nom racine, plantage!

// var FoldersModelKcEditor = [];

//Html tab size
var htmlEditorTabSize = '2';


var ModelsFmItemFilterRef= 
{ 
    "list" : [
        //from root tree to subfolders desc  
       
        //-------------------------------------
        // _agency/home-page-sections part   --
        //-------------------------------------
        {  
            "folderTree":[
                "_agency/home-page-sections/$xxx",
                "_detailed-contents/detailed-contents/$xxx"
                //note add $xxx to create file on any subfolder that can be created 
            ],                           
            "list_meta":
            { 
                "title": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"A new title",
                        "comment": ""
                    },
                    "show_editor":true,
                    "trad_editor":"Title" 
                },
                "date-publication": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "value":"current_date_time_int",
                        "placeholder":"",
                        "comment": ""
                    },
                    "comment_add_text_on_create": "*It is required to subtract an hour to appear on the site",
                    "show_editor":true,
                    "trad_editor":"Date publication"                    
                },               
                "order": {
                    "form": {
                        "tag": "input",
                        "type": "number",
                        "min_max_value": [1,100],
                        "value":1,
                        "placeholder":"",
                        "comment": "Highest priority  at 1; display first.<br/><strong style='color:#5BC0DE;'>If priority is more than 99, not displayed.</strong>."
                    },
                    "show_editor":true,
                    "trad_editor":"Order display"  
                }, 
                "type_editor": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["SimpleMd","CkEditor(Word)"],// ! used in main.js
                        "options_trad": ["SimpleMd Editor","CkEditor with Word"],
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_on_create_only": true,
                    "trad_editor":"Type Editor" 
                },            
                //intern
                "last_modified": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "value":"current_date_time_int",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":false                   
                }
                
            }//fin list_meta
                        
        },
        //------
        {
            "folderTree":"_agency/home-page-sections/about-timeline",
            "list_meta":
            {                
                "description": {
                    "form": {
                        "tag": "textarea",
                        "rows": 3,      
                        "max_length": 120,                  
                        "comment": ""
                    },
                    "show_editor":true,
                    "trad_editor":"Short description" 
                },                
                "type-timeline": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["default","inverted","text"],
                        "options_trad": ["text on left + miniature","miniature + text on right","text only"],
                        "comment": ""
                    },
                    "show_editor":true,
                    // "show_disabled_field":true,
                    // "show_enabled_on_create_only": true,
                    "trad_editor":"Type timeline" 
                },
                "type-miniature": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["image-circle"],
                        "options_trad": ["image on circle"],
                        "comment": ""
                    },
                    "display_depend_on": "type-timeline", // must be : type-{key} !! type-{key} of type select
                    "display_depend_on_extra": "text",
                    "show_editor":true,
                    "show_disabled_field":true,                    
                    "trad_editor":"Type miniature" 
                },
                "miniature": {
                   "form": {
                        "tag": "image",
                        "type": "",
                        "value":"home-page-sections/default.jpg",
                        "placeholder":"",
                        "comment": ""
                    },
                    "display_depend_on": "type-timeline", // must be : type-{key} !! type-{key} of type select
                    "display_depend_on_extra": "text",
                    "comment_add_text_from_section": "miniature_size_child", //add comment from section ref; must be tag input !
                    "show_editor":true,
                    "trad_editor":"Image miniature"                    
                }                            
            }//fin list_meta             
        },
        //------ 
        {
            "folderTree":"_agency/home-page-sections/clients",
            "list_meta":
            {
                "link": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 300,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":true,
                    "trad_editor":"Link" 
                },
                "description-link": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 150,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":true,
                    "trad_editor":"Link description" 
                },
                "type-miniature": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["image-centered"],
                        "options_trad": ["image centered"],
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_disabled_field":true,
                    "trad_editor":"Type miniature" 
                },
                "miniature": {
                   "form": {
                        "tag": "image",
                        "type": "",
                        "value":"home-page-sections/default.jpg",
                        "placeholder":"",
                        "comment": ""
                    },
                    "comment_add_text_from_section": "miniature_size_child",
                    "show_editor":true,
                    "trad_editor":"Image miniature"

                }              
            }//fin list_meta             
        },        
        //------
        {
            "folderTree":"_agency/home-page-sections/services",
            "list_meta":
            {                  
                "type-miniature": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["font-awesome","image-circle"],
                        "options_trad": ["icon font-awesome","image on circle"],
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_disabled_field":true,
                    "show_enabled_on_create_only": true,
                    "trad_editor":"Type miniature" 
                },
                "miniature": {
                   "form": {
                        "tag": "image",
                        "type": "",
                        "value":"home-page-sections/default.jpg",
                        "placeholder":"",
                        "comment": ""
                    },
                    "comment_add_text_from_section": "miniature_size_child",
                    "display_depend_on": "type-miniature", // must be : type-{key} !! type-{key} of type select
                    "display_depend_on_extra": "font-awesome",
                    "show_editor":true,
                    "trad_editor":"Miniature",
                    
                }              
            }//fin list_meta             
        },
        //------ 
        {
            "folderTree":"_agency/home-page-sections/team",
            "list_meta":
            {  
                "position": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": [""],
                        "comment": ""
                    },
                    "list_options_from_section": "position_child_list",
                    "show_editor":true,
                    "show_disabled_field":false,
                    "trad_editor":"Position" 
                },                
                "type-miniature": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["image-circle"],
                        "options_trad": ["image on circle"],
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_disabled_field":true,
                    "trad_editor":"Type miniature" 
                },
                "miniature": {
                   "form": {
                        "tag": "image",
                        "type": "",
                        "value":"home-page-sections/default.jpg",
                        "placeholder":"",
                        "comment": ""
                    },
                    "comment_add_text_from_section": "miniature_size_child",
                    "show_editor":true,
                    "trad_editor":"Miniature"
                }              
            }//fin list_meta             
        },        
        //------
        //-----------------------------------------
        // _end agency/home-page-sections part   --
        //-----------------------------------------

        //------------------------------------
        // detailed-contents/portfolio part   --
        //------------------------------------
        {
            "folderTree":"_detailed-contents/detailed-contents/portfolio",
            "list_meta":
            {
                "description": {
                    "form": {
                        "tag": "textarea",
                        "rows": 3,      
                        "max_length": 120,                  
                        "comment": ""
                    },
                    "show_editor":true,
                    "trad_editor":"Short description" 
                },
                "subtitle": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": [""],
                        "comment": ""
                    },
                    "list_options_from_section": "subtitle_child_list",
                    "show_editor":true,
                    "show_disabled_field":false,
                    "trad_editor":"Subtitle"
                    
                }, 
                "project-date": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":true,
                    "trad_editor":"Project date" 
                },
                "client": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": [""],
                        "comment": ""
                    },
                    "list_options_from_section": "client_child_list",
                    "show_editor":true,
                    "trad_editor":"Client"
                    
                },
                "category": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": [""],
                        "comment": ""
                    },
                    "list_options_from_section": "category_child_list",
                    "show_editor":true,
                    "trad_editor":"Category"
                    
                },
                "type-miniature": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["image-centered"],
                        "options_trad": ["image centered"],
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_disabled_field":true,
                    "trad_editor":"Type of miniature" 
                },                    
                "miniature_is_reduced_img": {
                    "form": {
                        "tag": "input",
                        "type": "checkbox",
                        "value": "true",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":false,
                    "trad_editor":"Reduce image" 
                },
                "description-image": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 150,
                        "value":"",
                        "placeholder":"* SEO information needed",
                        "comment": ""
                    },
                    "show_editor":true,
                    "trad_editor":"Description image" 
                },                             
                "image": {
                   "form": {
                        "tag": "image",
                        "type": "",
                        "value":"home-page-sections/default.jpg",
                        "placeholder":"",
                        "comment": ""
                    },
                    "comment_add_text_from_section": "image_size_child",
                    "show_editor":true,
                    "trad_editor":"Image" 
                },
                "miniature": {
                   "form": {
                        "tag": "image",
                        "type": "",
                        "value":"home-page-sections/default.jpg",
                        "placeholder":"",
                        "comment": ""
                    },
                    "comment_add_text_from_section": "miniature_size_child",                    
                    "checked_input": "miniature_is_reduced_img",
                    "show_editor":true,
                    "trad_editor":"Miniature"
                }                                    
            }//fin list_meta             
        },
        //----------------------------------------
        // end detailed-contents/portfolio part   --
        //----------------------------------------


        
        //-----------------------------
        // agency/site-config part   --
        //-----------------------------
        {  
            "folderTree":[
                "_agency/site-config/$xxx"             
                //note add $xxx to create file on any subfolder that can be created 
            ],                           
            "list_meta":
            { 
                "title": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"A new title",
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_disabled_field":true,
                    "show_enabled_on_create_only": true,
                    "trad_editor":"Title" 
                },
                "date-publication": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "value":"current_date_time_int",
                        "placeholder":"",
                        "comment": ""
                    },
                    "comment_add_text_on_create": "*It is required to subtract an hour to appear on the site",
                    "show_editor":false,
                    "trad_editor":"Date publication"                    
                },
                "type_editor": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["SimpleMd","CkEditor(Word)"],// ! used in main.js
                        "options_trad": ["SimpleMd Editor","CkEditor with Word"],
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_on_create_only": true,
                    "trad_editor":"Type Editor" 
                },            
                //intern
                "last_modified": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "value":"current_date_time_int",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":false                   
                }
                
            }//fin list_meta
                        
        },
        //------       
        {
            "folderTree":"_agency/site-config/background-images",
            "customModeImage": "baseurl",
            "list_meta":
            {
                "order": {
                    "form": {
                        "tag": "input",
                        "type": "number",
                        "min_max_value": [1,100],
                        "value":1,
                        "placeholder":"",
                        "comment": "Highest priority  at 1; display first.<br/><strong style='color:#5BC0DE;'>If priority is more than 99, not displayed.</strong>."
                    },
                    "show_editor":false,
                    "trad_editor":"Order display"  
                },
                "element-ref": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_on_create_only": true,
                    "trad_editor":"Element html reference" 
                },
                "element-id": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_on_create_only": true,
                    "trad_editor":"Element html id" 
                },                
                "description-image": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 150,
                        "value":"",
                        "placeholder":"* SEO information needed",
                        "comment": ""
                    },
                    "show_editor":true,
                    "trad_editor":"Description image"                    
                },
                "size-ref": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 150,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_on_create_only": true,
                    "trad_editor":"Information size image" 
                },
                "image": {
                   "form": {
                        "tag": "image",
                        "type": "",
                        "value":"site-config/default.jpg",
                        "placeholder":"",
                        "comment": ""
                    },
                    "comment_add_text_from_input": "size-ref", //add comment from meta in current; must be tag input !
                    "show_editor":true,
                    "trad_editor":"Image"
                    
                }     
            }//fin list_meta             
        },
        //------ 
        {
            "folderTree":"_agency/site-config/footer",
            "list_meta":
            {
                "order": {
                    "form": {
                        "tag": "input",
                        "type": "number",
                        "min_max_value": [1,100],
                        "value":1,
                        "placeholder":"",
                        "comment": "Highest priority  at 1; display first.<br/><strong style='color:#5BC0DE;'>If priority is more than 99, not displayed.</strong>."
                    },
                    "show_editor":true,
                    "trad_editor":"Order display"  
                },  
                "element-ref": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["list","span"],
                        "options_trad": ["type list","type span, one line"],
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_on_create_only": true,
                    "trad_editor":"Element html reference" 
                },
                "element-id": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_on_create_only": true,
                    "trad_editor":"Element html id" 
                }                
            }//fin list_meta             
        },
        //------ 
        {
            "folderTree":"_agency/site-config/google-font",
            "list_meta":
            {
                "order": {
                    "form": {
                        "tag": "input",
                        "type": "number",
                        "min_max_value": [1,100],
                        "value":1,
                        "placeholder":"",
                        "comment": "Highest priority  at 1; display first.<br/><strong style='color:#5BC0DE;'>If priority is more than 99, not displayed.</strong>."
                    },
                    "show_editor":false,
                    "trad_editor":"Order display"  
                },   
                "link_font": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 200,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "input_reference_comment": "link_font_ref",
                    "show_editor":true,
                    "trad_editor":"URL fonts.googleapis"                    
                },
                "link_font_ref": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 200,
                        "value":"",
                        "placeholder":"",
                        "comment": "Created with url "
                    },
                    "show_editor":false,
                    "trad_editor":"" 
                }                  
            }//fin list_meta             
        },
        {
            "folderTree":"_agency/site-config/palette-color",
            "list_meta":
            {
                "order": {
                    "form": {
                        "tag": "input",
                        "type": "number",
                        "min_max_value": [1,100],
                        "value":1,
                        "placeholder":"",
                        "comment": "Highest priority  at 1; display first.<br/><strong style='color:#5BC0DE;'>If priority is more than 99, not displayed.</strong>."
                    },
                    "show_editor":false,
                    "trad_editor":"Order display"  
                },   
                "color": {
                    "form": {
                        "tag": "input",
                        "type": "color",
                        "max_length": 7,
                        "value":"#4286f4",
                        "placeholder":"",
                        "comment": ""
                    },
                    "input_reference_comment": "color_ref", 
                    "show_editor":true,
                    "trad_editor":"Color"                    
                },
                "color_ref": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"",
                        "comment": "Created with color "
                    },
                    "show_editor":false,
                    "trad_editor":"" 
                }             
            }//fin list_meta             
        },
        {
            "folderTree":"_agency/site-config/welcome-message",
            "list_meta":
            {
                "order": {
                    "form": {
                        "tag": "input",
                        "type": "number",
                        "min_max_value": [1,100],
                        "value":1,
                        "placeholder":"",
                        "comment": "Highest priority  at 1; display first.<br/><strong style='color:#5BC0DE;'>If priority is more than 99, not displayed.</strong>."
                    },
                    "show_editor":true,
                    "trad_editor":"Order display"  
                }       
            }//fin list_meta             
        },
        //------ 
        //-----------------------------------
        // end agency/site-config part   ----
        //-----------------------------------
       
        //------
        //specific bloque create, delete file
        // 
        {
            "folderTree":[
                "_agency/home-page-sections/contact",
                "_agency/home-page-sections/portfolio",
                "_agency/site-config/$xxx"  
            ],
            "modifyOnly": true,
            "list_meta":
            {
                
            }//fin list_meta             
        }
        //------

       

    ] //fin list
}; // end ModelsFmItemFilterRef




var ModelsFmSectionFilterRef= 
{ 
    "list" : [
        //from root tree to subfolders desc 
        //----------       
        {  
            "folderTree":
            [
                // "_agency/home-page-sections", // needed to create section in "_agency/home-page-sections"
                "_agency/home-page-sections/$xxx" //add /$xxx let custom section as "_agency/home-page-sections/team", but can't create section in "_agency/home-page-sections"
            ], 
            "modifyOnly": true,
            "show_btn_delete_if_empty": false,
            "filter_meta_mode_admin":true,
            "filter_section_mode_admin":false,        
            "list_meta":
            { 
                "title": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_disabled_field":true,
                    "show_enabled_on_create_only": true,
                    "trad_editor":"Titre" 
                },
                "date-publication": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "value":"current_date_time_int",
                        "placeholder":"",
                        "comment": ""
                    },
                    "comment_add_text_on_create": "*It is required to subtract an hour to appear on the site",
                    "show_editor":false,
                    "trad_editor":"Date de publication"                    
                },
                "order": {
                    "form": {
                        "tag": "input",
                        "type": "number",
                        "min_max_value": [1,100],
                        "value":1,
                        "placeholder":"",
                        "comment": "Highest priority  at 1; display first.<br/><strong style='color:#5BC0DE;'>If priority is more than 99, not displayed.</strong>."
                    },
                    "show_editor":true,
                    "trad_editor":"Order display"  
                },    
                "description": {
                    "form": {
                        "tag": "textarea",
                        "rows": 3,      
                        "max_length": 120,                  
                        "comment": ""
                    },
                    "show_editor":true,
                    "trad_editor":"Short description" 
                },  
                "path-navig": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"",
                        "comment": "if a short title is defined, added to the header navigation; sort depending order. "
                    },
                    "show_editor":true,
                    "trad_editor":"Navigation Header" 
                },                
                "custom_bg_color": {
                    "form": {
                        "tag": "input",
                        "type": "color",
                        "max_length": 7,
                        "value":"#ffffff",
                        "placeholder":"",
                        "comment": "Need Custom option in Mode Background Sections if activated.<br/>See Site configuration / Background sections Metadata"
                    },
                    "show_editor":true,
                    "checked_input": "checked_custom_bg",
                    "trad_editor":"Custom background color" 
                },
                "checked_custom_bg": {
                    "form": {
                        "tag": "input",
                        "type": "checkbox",
                        "value":"false",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":false,
                    "trad_editor":"Activate" 
                },
                "type_child_editor": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["SimpleMd","CkEditor(Word)","NoEditor","NoContent"],// ! used in main.js
                        "options_trad": ["SimpleMd Editor","CkEditor with Word","No Editor, only access metadata settings","No Content at all"],
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_on_create_only": true,
                    "trad_editor":"Default Editor on child" 
                },
                "miniature_size_child": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 200,
                        "value":"",
                        "placeholder":"",
                        "comment": "Add information about the size of the uploaded miniature jpg, png "
                    },
                    "show_editor":true,
                    "show_on_create_only": true,
                    "trad_editor":"Comment miniature size" 
                }, 
                //intern
                "last_modified": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "value":"current_date_time_int",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":false                   
                }, 
                "sort_items": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["order"],
                        "comment": ""
                    },
                    "show_editor":false,
                },
                "model": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["display-on-parent-and-no-personal-page"],
                        "comment": ""
                    },
                    "show_editor":false,
                }
            }//fin list_meta
                        
        },
        //----------
        {  
            "folderTree":["_agency/home-page-sections/team"],
            "modifyOnly": true,
            "show_btn_delete_if_empty": false,          
            "list_meta":
            {                    
                "position_child_list": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 200,
                        "value":"",
                        "placeholder":"",
                        "comment": "Separated with comma. Ex: <strong style='color:#5BC0DE;'>Lead Developer,Lead Designer</strong> "
                    },
                    "show_editor":true,
                    "trad_editor":"List of position options" 
                },
                "last_words": {
                    "form": {
                        "tag": "textarea",
                        "rows": 3,      
                        "max_length": 250,                  
                        "comment": ""
                    },
                    "show_editor":true,
                    "trad_editor":"Last words" 
                }
                
            }//fin list_meta
                        
        },
        //----------
        //----------
        {  
            "folderTree":["_detailed-contents/detailed-contents/$xxx"],
            "modifyOnly": true,
            "show_btn_delete_if_empty": false, 
            "filter_meta_mode_admin":true,
            "filter_section_mode_admin":false,         
            "list_meta":
            { 
                "title": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_disabled_field":true,
                    "show_enabled_on_create_only": true,
                    "trad_editor":"Title" 
                },
                "date-publication": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "value":"current_date_time_int",
                        "placeholder":"",
                        "comment": ""
                    },
                    "comment_add_text_on_create": "*It is required to subtract an hour to appear on the site",
                    "show_editor":false,
                    "trad_editor":"Date publication"                    
                },
                "order": {
                    "form": {
                        "tag": "input",
                        "type": "number",
                        "min_max_value": [1,100],
                        "value":1,
                        "placeholder":"",
                        "comment": "Highest priority  at 1; display first.<br/><strong style='color:#5BC0DE;'>If priority is more than 99, not displayed.</strong>."
                    },
                    "show_editor":false,
                    "trad_editor":"Order display"  
                },     
                "type_child_editor": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["SimpleMd","CkEditor(Word)","NoEditor","NoContent"],// ! used in main.js
                        "options_trad": ["SimpleMd Editor","CkEditor with Word","No Editor, only access metadata settings","No Content at all"],
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_on_create_only": true,
                    "trad_editor":"Default Editor on child" 
                },                
                //intern
                "last_modified": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "value":"current_date_time_int",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":false                   
                }, 
                "sort_items": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["order","date-publication"],
                        "options_trad": ["Order","Date publication"],
                        "comment": ""
                    },
                    "show_editor":true,
                    "trad_editor":"Sort items"
                },
                "model": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["display-on-parent-and-no-personal-page"],
                        "comment": ""
                    },
                    "show_editor":false,
                }
            }//fin list_meta
                        
        },
        //------------
        {  
            "folderTree":["_detailed-contents/detailed-contents/portfolio"],
            "modifyOnly": true,                  
            "list_meta":
            {                  
                "subtitle_child_list": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 200,
                        "value":"",
                        "placeholder":"",
                        "comment": "Separated with comma. Ex: <strong style='color:#5BC0DE;'>Website Design,Graphic Design</strong> "
                    },
                    "show_editor":true,
                    "trad_editor":"List of subtitle options" 
                },
                "category_child_list": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 200,
                        "value":"",
                        "placeholder":"",
                        "comment": "Separated with comma. Ex: <strong style='color:#5BC0DE;'>Website Design,Graphic Design</strong> "
                    },
                    "show_editor":true,
                    "trad_editor":"List of category options" 
                },
                "client_child_list": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 200,
                        "value":"",
                        "placeholder":"",
                        "comment": "Separated with comma. Ex: <strong style='color:#5BC0DE;'>Start Bootstrap,Twitter</strong> "
                    },
                    "show_editor":true,
                    "trad_editor":"List of client options" 
                },
                "miniature_size_child": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 200,
                        "value":"",
                        "placeholder":"",
                        "comment": "Add information about the size of the uploaded miniature jpg, png "
                    },
                    "show_editor":true,
                    "show_on_create_only": true,
                    "trad_editor":"Comment miniature size" 
                },
                "image_size_child": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 200,
                        "value":"",
                        "placeholder":"",
                        "comment": "Add information about the size of the uploaded miniature jpg, png "
                    },
                    "show_editor":true,
                    "show_on_create_only": true,
                    "trad_editor":"Comment image size" 
                }
            }//fin list_meta                        
        },
        //------------
        //------------
        {
            "folderTree": [
                "_agency/site-config/google-font",
                "_agency/site-config/footer",
                "_agency/site-config/background-sections"
            ],
            "modifyOnly": true,            
            "list_meta":
            { 
                "title": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_disabled_field":true,
                    "show_enabled_on_create_only": true,
                    "trad_editor":"Title" 
                },
                "date-publication": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "value":"current_date_time_int",
                        "placeholder":"",
                        "comment": ""
                    },
                    "comment_add_text_on_create": "*It is required to subtract an hour to appear on the site",
                    "show_editor":false,
                    "trad_editor":"Date publication"                    
                },
                "order": {
                    "form": {
                        "tag": "input",
                        "type": "number",
                        "min_max_value": [1,100],
                        "value":1,
                        "placeholder":"",
                        "comment": "Highest priority  at 1; display first.<br/><strong style='color:#5BC0DE;'>If priority is more than 99, not displayed.</strong>."
                    },
                    "show_editor":false,
                    "trad_editor":"Order display"  
                },
                "type_child_editor": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["SimpleMd","CkEditor(Word)","NoEditor","NoContent"],// ! used in main.js
                        "options_trad": ["SimpleMd Editor","CkEditor with Word","No Editor, only access metadata settings","No Content at all"],
                        "comment": ""
                    },
                    "show_editor":true,
                    "show_on_create_only": true,
                    "trad_editor":"Type Editor child" 
                },
                //intern
                "last_modified": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "value":"current_date_time_int",
                        "placeholder":"",
                        "comment": ""
                    },
                    "show_editor":false                   
                },                
                "model": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["display-on-parent-and-no-personal-page"],
                        "comment": ""
                    },
                    "show_editor":false,
                }                                  
            }//fin list_meta             
        },
        {
            "folderTree":"_agency/site-config/google-font",
            "modifyOnly": true,            
            "list_meta":
            {                
                "font_common": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 200,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "input_reference_comment": "font_common_ref", //add comment from meta in current; must be tag input !
                    "show_editor":true,
                    "trad_editor":"List common fonts"
                    
                },
                "font_common_ref": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 200,
                        "value":"",
                        "placeholder":"",
                        "comment": "Created with fonts "
                    },
                    "show_editor":false,
                    "trad_editor":"" 
                }                 
            }//fin list_meta             
        },
        {  
            "folderTree":["_agency/site-config/footer"],
            "modifyOnly": true,
            "list_meta":
            {
                "sort_items": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["order"],
                        "comment": ""
                    },
                    "show_editor":false,
                },                    
                "bg_color_footer": {
                    "form": {
                        "tag": "input",
                        "type": "color",
                        "max_length": 7,
                        "value":"#ffffff",
                        "placeholder":"",
                        "comment": ""
                    },
                    "input_reference_comment": "bg_color_footer_ref", //add comment from meta in current; must be tag input !
                    "show_editor":true,
                    "trad_editor":"Background color"                    
                },
                "bg_color_footer_ref": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 150,
                        "value":"",
                        "placeholder":"",
                        "comment": "Created with color "
                    },
                    "show_editor":false,
                    "trad_editor":"" 
                },
                "list_color_id_value": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 300,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "input_list_id_value": "color",
                    "show_editor":false,
                    "trad_editor":"" 
                }  
            }//fin list_meta
                        
        },
        {
            "folderTree":"_agency/site-config/background-sections",
            "modifyOnly": true,            
            "list_meta":
            {                
                "type_background_section": {
                    "form": {
                        "tag": "select",
                        "extra": "",//multiple
                        "options": ["Alternate2","Alternate3","Custom","Alternate2-Custom","Alternate3-Custom"],// ! used in main.js
                        "options_trad": ["Alternate with 2 colors","Alternate with 3 colors","Used Custom colors defined in home page sections settings","Alt. 2 colors + Custom colors ","Alt. 3 colors + Custom colors"],
                        "comment": ""
                    },
                    "show_editor":true,                    
                    "trad_editor":"Mode Background Sections Home Page" 
                },
                "bg_sections_alt1": {
                    "form": {
                        "tag": "input",
                        "type": "color",
                        "max_length": 7,
                        "value":"#ffffff",
                        "placeholder":"",
                        "comment": ""
                    },
                    "input_reference_comment": "bg_sections_alt1_ref", //add comment from meta in current; must be tag input !
                    "show_editor":true,
                    "trad_editor":"Background color alternate #1"                    
                },
                "bg_sections_alt1_ref": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"",
                        "comment": "Created with color "
                    },
                    "show_editor":false,
                    "trad_editor":"" 
                },
                "bg_sections_alt2": {
                    "form": {
                        "tag": "input",
                        "type": "color",
                        "max_length": 7,
                        "value":"#f7f7f7",
                        "placeholder":"",
                        "comment": ""
                    },
                    "input_reference_comment": "bg_sections_alt2_ref", //add comment from meta in current; must be tag input !
                    "show_editor":true,
                    "trad_editor":"Background color alternate #2"                    
                },
                "bg_sections_alt2_ref": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"",
                        "comment": "Created with color "
                    },
                    "show_editor":false,
                    "trad_editor":"" 
                },
                "bg_sections_alt3": {
                    "form": {
                        "tag": "input",
                        "type": "color",
                        "max_length": 7,
                        "value":"#ffffff",
                        "placeholder":"",
                        "comment": "specific mode Alternate3"
                    },
                    "input_reference_comment": "bg_sections_alt3_ref", //add comment from meta in current; must be tag input !
                    "show_editor":true,
                    "trad_editor":"Background color alternate #3"                    
                },
                "bg_sections_alt3_ref": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"",
                        "comment": "Created with color "
                    },
                    "show_editor":false,
                    "trad_editor":"" 
                },
                "bg_sections_default_custom": {
                    "form": {
                        "tag": "input",
                        "type": "color",
                        "max_length": 7,
                        "value":"#ffffff",
                        "placeholder":"",
                        "comment": ""
                    },
                    "input_reference_comment": "bg_sections_default_custom_ref", //add comment from meta in current; must be tag input !
                    "show_editor":true,
                    "trad_editor":"Default custom background"                    
                },
                "bg_sections_default_custom_ref": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 100,
                        "value":"",
                        "placeholder":"",
                        "comment": "Created with color "
                    },
                    "show_editor":false,
                    "trad_editor":"" 
                },
                "list_color_id_value": {
                    "form": {
                        "tag": "input",
                        "type": "text",
                        "max_length": 300,
                        "value":"",
                        "placeholder":"",
                        "comment": ""
                    },
                    "input_list_id_value": "color",
                    "show_editor":false,
                    "trad_editor":"" 
                }                                 
            }//fin list_meta             
        }
       

    ] //fin list
}; // end ModelsFmSectionFilterRef

