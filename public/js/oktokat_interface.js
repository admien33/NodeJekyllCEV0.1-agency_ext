//++++++++++++++++++++++++++
// Octokat interface    ++++
//++++++++++++++++++++++++++

var CurrentRefsHeadsCommitSha=null; //vargl
var CurrentRefsHeadsMasterCommitSha=null; //vargl
var filename_updated;
var _interm_path_to_update;
var _interm_sha_to_update;
var _interm_path_dir;
var _interm_ref_heads_commit_sha;
var _interm_commit_msg;


//Current user
function CurrentUserOcto(callback) {
    octo.user.fetch(callback);
}
//return Tree root
function TreeRootOcto(_branch,callback){

	octoRepo.git.trees(_branch).fetch(function(err,data) {
			callback(data.tree);
		}
	);	
}
//Show Folders Content
function ContentOcto(path, branch, callback) {

	octoRepo.contents(encodeURI(path)).fetch({ref:branch}, callback);
}

function ShaFolder(path, branch, callback) {
    
    var filteringPath = function (_data) {
    	var cpt_elt=0;
    	var sha;
    	_data.forEach(function(value, index) {
	    	if(value.path === decodeURI(path)){
	     		sha=value.sha;
	    	}
	    	cpt_elt++;	    		    	
	    });
	    if (cpt_elt >=_data.length) {
	    	callback(sha);
	    }
  	};
  	var cut = path.lastIndexOf('/');  
    if(cut===-1) {
    	TreeRootOcto(branch,function(data){
    		filteringPath(data);			
		});
    }
    else {
    	var fname = path.substring(cut + 1);
    	var findIn = decodeURI(path).replace('/' + fname, '');
    	ContentOcto(findIn, branch, function(err,data){
    		filteringPath(data);    		
		 });
    }	  
}

function ShaFolder_fetch(path, branch) {
    
    function filteringPath (_data) {
    	var cpt_elt=0;
    	var sha;
    	_data.forEach(function(value, index) {
	    	if(value.path === decodeURI(path)){
	     		sha=value.sha;
	    	}
	    	cpt_elt++;	    		    	
	    });
	    if (cpt_elt >=_data.length) {
	    	return sha;
	    }
  	}

  	var cut = path.lastIndexOf('/');  
    if(cut===-1) {
    	return octoRepo.git.trees(branch).fetch().then( function (data) {
    		return filteringPath(data.tree);
    	});
    }
    else {
    	var fname = path.substring(cut + 1);
    	var findIn = decodeURI(path).replace('/' + fname, '');
    	return octoRepo.contents(encodeURI(findIn)).fetch({ref:branch}).then( function (data) {
    		return filteringPath(data);
    	});    	
    }	  
}

//Read file with blob
function ReadBlob(path, branch, callback) {
	ShaFolder(encodeURI(path), branch, function(data) {
		if(data===undefined)
		{
			callback(undefined);
		}
		else {
			octoRepo.git.blobs(data).read().then(function(content) {
				callback(content);
			});
		}
		
	});
}

//++++++++++++++++++++++++++++++++
//Update & create 1 raw file, choose encoding "utf8", "base64"
// info git : https://developer.github.com/v3/git/, detailed steps 1., 2. , ...
// // https://gist.github.com/StephanHoyer/91d8175507fcae8fb31a commiting multiples files
// // https://github.com/philschatz/octokat.js/issues/97

//add type : dir, tree / file, blob
function UpdateCreateOneFile(path, branch, content,encoding, commitMsg, callback) {

	var _sha_new_blob = null;
	_interm_commit_msg=commitMsg;
	
	// 3. retrieve the content of the blob object that tree has for that particular file path
	// 4.change the content somehow and post a new blob object with that new content, getting a blob SHA back
	octoRepo.git.blobs.create({"content":content,"encoding":encoding}).then(
		function(data) {
			_sha_new_blob=data.sha;
			loopUpdateLevels(path,_sha_new_blob).then(function(res) {
			    console.log('results', res);			    		    
			    return callback(res);
			}).catch(function(err) {
			    console.log('some error along the way', err);
			});				
		}
	);	
}
// subfunctions Update & create 1 raw file
function loopUpdateLevels(_path_blob,_sha_new_blob) {
	//extract path info
	var split_path = _path_blob.split('/');
	var interm_length=split_path.length-1;	
	var interm_path;	
	//param loop 
  var iter_loop = interm_length;
  var limit = 0;
  var results = [];	
  //param previous iter, input next loop
	var path_prev;
	var sha_prev;
	
	function paramGetter() {
   	interm_path='';
   	var iter_loop_index=iter_loop-1;
   	for (var j = 0; j <= iter_loop_index; j++) 
   	{
			interm_path=interm_path.concat(split_path[j]);
			interm_path=interm_path.concat('/');				
		}
		interm_path=interm_path.slice(0,interm_path.length-1);			
		
		if (iter_loop===interm_length) {
			path_prev=split_path[split_path.length-1];
			sha_prev=_sha_new_blob;
			filename_updated=path_prev;
			//update commit msg if empty			
			if (_interm_commit_msg.length===0) {
				_interm_commit_msg='update file '+path_prev;
			}	
		}

		return [iter_loop,interm_path, path_prev,sha_prev];
   }

    function conditionChecker() {
        return iter_loop >= limit;
    }

    function iter_callback(result) {
      results.push(result);
      path_prev=result[0];
      sha_prev=result[1];
      iter_loop--;
    }

    return promiseLoop(makeUpdate, paramGetter, conditionChecker, iter_callback)
      .then(function() {
          return results;
      });
}
// subfunction call promideLoop, Update & create 1 raw file
function makeUpdate(iter, path_dir, path_to_update, sha_to_update) {
    return new Promise(function(resolve, reject) {    			

		_interm_path_to_update=path_to_update;
		_interm_sha_to_update=sha_to_update;
		_interm_path_dir=path_dir;
		_interm_ref_heads_commit_sha=null;

		var updateTreeObjectSha = function (err, data) {
			//on tree, extract index current file to update
			// if not detect, create file
			var index_file=0;
			var postTree;
			var flag_detect_on_tree=false;
			data.tree.forEach(function(value, index) {
				if(value.path===_interm_path_to_update) {
					flag_detect_on_tree=true;
					index_file=index;
				}					
			});
			if (flag_detect_on_tree===true) {
				postTree=[ 					{
						path: data.tree[index_file].path,
						mode: data.tree[index_file].mode,
						type: data.tree[index_file].type,
						sha:  _interm_sha_to_update
	            	}
	            ];
	         }
	         else {
	         	//create file : (type, mode) : (blob,100644) or (tree,040000)
	         	var type_file,mode_file;
	         	if (_interm_path_to_update===filename_updated) {
	         		type_file='blob';
	         		mode_file='100644';
	         	}
	         	else {
	         		type_file='tree';
	         		mode_file='040000';
	         	}
	         	postTree=[ 
					{
						path: _interm_path_to_update,
						mode: mode_file,
						type: type_file,
						sha:  _interm_sha_to_update
	            	}
	            ];
	         }
			// 5.post a new tree object with that file path pointer replaced with your new blob SHA getting a tree SHA back
			octoRepo.git.trees.create({			
    			tree: postTree,         		
         		base_tree: data.sha
			})
			.then(function(data_tree) {
				// console.log(data_tree);					
				if (_interm_ref_heads_commit_sha!==null) {
					//last iter :
					// 6. create a new commit object with the current commit SHA as the parent and the new tree SHA, getting a commit SHA back					
					octoRepo.git.commits.create({"message":_interm_commit_msg,"tree":data_tree.sha,"parents":[_interm_ref_heads_commit_sha]})
					.then(function(data_commit) {
						// 7. update the reference of your branch to point to the new commit SHA
						octoRepo.git.refs.heads(Git_refs_heads).update({
					        sha: data_commit.sha,
					        force: false
					      })
						.then(function(data_ref) {
							//update ref global commit ref heads for next process
							CurrentRefsHeadsCommitSha=data_ref.object.sha;
							resolve(['commit done']);
						});
					});					
				}
				else {
					// update next iter : [path_to_update, sha_to_update]
					var cut = _interm_path_dir.lastIndexOf('/');
		    		var fname = _interm_path_dir.substring(cut + 1);
					// console.log('update next iter, _sha : '+ data_tree.sha+'name: '+fname);
					resolve([fname,data_tree.sha]);
				}			    	
			});			
		};

		
		//on each loop
		if (iter>0) {
			ShaFolder(encodeURI(_interm_path_dir), Git_refs_heads, function(_sha) {
				octoRepo.git.trees(_sha).fetch(updateTreeObjectSha);
	    	});			
		} 
		else {
			//last iter, create commit, update refs, heads
			// 1. get the current commit object : CurrentRefsHeadsCommitObject
	    	_interm_ref_heads_commit_sha=CurrentRefsHeadsCommitSha;
	    	// 2. retrieve the tree it points to 
	    	octoRepo.git.trees(CurrentRefsHeadsCommitSha).fetch(updateTreeObjectSha);
	    }    	
    });
}

//++++++++++++++++++++++++++++++++++++++
//upload 1 or collection of drop images; if image with same name, add new one with timestamp unix added on the name
//commit_msg auto
function UploadDropImages(path_image, ref$_dropImages, ref$_progress,augmentInProgress, callback) {

	var array_img = $.makeArray( $(ref$_dropImages) );
	var modified_filename=[];


	//test path_image as sha ref
	var prom=new Promise(function(resolve, reject) {

		ShaFolder(path_image, Git_refs_heads, function(data) {		
			if (data!==undefined) {
				//repo with this filename already exist
				resolve();
			}
			else
			{
				var path_empty_folder = path_image + '/' + file_new_folder_img_gl;
				//create new repo with default empty file
				octoRepo.contents(encodeURI(path_empty_folder)).add({ message: 'interne, add repo image '+path_image, content: '', branch: Git_refs_heads}).
				then(function(data){
					// get the current commit id of refs heads
					CurrentRefsHeadsCommitSha=data.commit.sha;
					resolve();				
					
				});	 
			}					
		});		
	});
	//and then update index.md linked to the new section with fm info
	prom.then(function(){

		octoRepo.contents(encodeURI(path_image)).fetch({ref:Git_refs_heads})
		.then(function(data){
			array_img.forEach( function(img) {
				if (img.src !== undefined) {
					var img_name=img.alt;
					//todo add tif, .tiff .gif .jpeg  .png .pdf
					// https://www.library.cornell.edu/preservation/tutorial/presentation/table7-1.html
					if(img_name.match('.jpg$') || img_name.match('.png$') || img_name.match('.gif$') || img_name.match('.svg$')){								
						modified_filename.push(img_name);
						data.forEach(function(file) {
							if (file.name === img_name) {
								var ext_tmp=/\.\w{2,4}$/.exec(img_name)[0];
								var new_ext='-'+moment().format('x')+ext_tmp;
								img_name=img_name.replace(/\.\w{2,4}$/,new_ext);
								modified_filename.pop();
								modified_filename.push(img_name);
							}
						});
					}
					else {
						modified_filename.push(undefined);
					}
				}
				else {
					modified_filename.push(undefined);
				}
			});
			loopUploadImages(modified_filename,path_image,array_img,ref$_progress,augmentInProgress).then(function(res) {
			    console.log('upload results', res);			    
			    return callback(res);
			}).catch(function(err) {
			    console.log('some error along the way', err);	
			});	
		});	

	});		
}

// subfunction upload images from dropzone
function loopUploadImages(filenames, path,data_img,refProgress,augmentProgress) {
	//extract  info
	var interm_filename;
	var interm_original_filename;//used for info user if upload failed
	var interm_content;	
	//param loop 
  var iter_loop = filenames.length-1;
  var limit = 0;
  var results = [];	
	
  function paramGetter() { 
	interm_filename=filenames[iter_loop];
	interm_content=data_img[iter_loop].src.replace('data:image/png;base64,','');	
	interm_original_filename=data_img[iter_loop].alt;
	
      return [path,interm_filename,interm_content,interm_original_filename];
  }

  function conditionChecker() {
      return iter_loop >= limit;
  }

  function iter_callback(result) {
      results.push(result);
      //add progress bar information
	$(refProgress+' .progress').attr('value', parseFloat($(refProgress+' .progress').attr('value')) + parseFloat(augmentProgress));
	$(refProgress+' .percent').text(Math.floor(parseInt($(refProgress+' .progress').attr('value'))) + ' %');

      iter_loop--;
  }

  return promiseLoop(makeUploadImage, paramGetter, conditionChecker, iter_callback)
    .then(function() {
        return results;
    });
}
// subfunction call promideLoop, Update & create 1 raw file
// function makeUploadImage(iter, path_dir, path_to_update, sha_to_update) {
function makeUploadImage(path_image,filename,content,original_filename) {
	return new Promise(function(resolve, reject) { 		
		//on each loop
		if (filename !== undefined) 
		{			
			var commit_msg = commitMsgUploadImage(filename,path_image);
			
			UpdateCreateOneFile(path_image + '/' + filename, Git_refs_heads, content,"base64", commit_msg, function(data) {
				resolve('upload '+filename+' done');			
			});	
		}
		else {
			resolve('upload '+original_filename+' failed');	
		}	
	});
}

//Remove one file
function Delete(path, branch, commit_msg, callback) {	
	// Sha(encodeURI(path), branch, function(data_sha) {
	ShaFolder(encodeURI(path), branch, function(data_sha) {
		if (data_sha !== undefined) {
			octoRepo.contents(encodeURI(path)).remove({ message: commit_msg, sha: data_sha, branch: branch}).
			then(function(data){
				// get the current commit id of refs heads
				CurrentRefsHeadsCommitSha=data.commit.sha;		
				
				return callback();				
			});	 
		} 
		else {
			return callback();
		}
	});
}
//Remove a section with files
function DeleteSectionWithItems(path_section,list_git_items,callback) {
	
	var filtered_name_index = "index.md";

	//1:delete all files on section, except index.md
	var prom=new Promise(function(resolve, reject) {

		loopDeleteFiles(list_git_items,filtered_name_index)
		.then(function(res) {
			UpdateLocalRepo();
		    console.log('delete files on section', res);	
		    resolve();
		}).catch(function(err) {
		    console.log('some error along the way', err);	
		    resolve();
		});
	
	});
	//and then update index.md linked to the new section with fm info
	prom.then(function(){
		//2:delete file index.md on last
		list_git_items.forEach(function(item) {
			if (item.name === filtered_name_index) 
			{
				var path_file = item.path;
				var commit_msg = commitMsgDeleteFile(path_file,false);		
				Delete(path_file, Git_refs_heads, commit_msg, function() {
					
					console.log('deleting last file '+path_file+' done');
					console.log('deleting section '+path_section+' done');
					return callback();
				});
			}
		});
	});		
}

// subfunction delete files
function loopDeleteFiles(list_git_items, filtered_name) {
	//extract  info
	var interm_path;
	var interm_name;	
	//param loop 
  var iter_loop = list_git_items.length-1;
  var limit = 0;
  var results = [];	
	
  function paramGetter() {
  	interm_name=list_git_items[iter_loop].name;
  	interm_path=list_git_items[iter_loop].path;

  	return [interm_path,interm_name,filtered_name];
  }

  function conditionChecker() {
  	return iter_loop >= limit;
  }

  function iter_callback(result) {
	  results.push(result);	
	  iter_loop--;
  }

  return promiseLoop(makeDeleteFile, paramGetter, conditionChecker, iter_callback)
    .then(function() {
        return results;
    });
}
// subfunction call promideLoop,
function makeDeleteFile(path_file,name_file, filtered_name) {
	return new Promise(function(resolve, reject) { 		
		//on each loop
		if (name_file !== filtered_name) {
			var commit_msg = commitMsgDeleteFile(path_file,false);		
			Delete(path_file, Git_refs_heads, commit_msg, function() {
				resolve('deleting file '+path_file+' done');
			});
		} else {
			resolve('not deleted; filtered file '+name_file);
		}				
	});
}


//+++++++++++++++++++++++++++
// end Octokat interface ++++
//+++++++++++++++++++++++++++

//++++++++++++++++++++++++++++++++++++
// extra functions
//++++++++++++++++++++++++++++++++++++
//http://stackoverflow.com/questions/24660096/correct-way-to-write-loops-for-promise
function promiseLoop(promiseFunc, paramsGetter, conditionChecker, eachFunc, delay) {
    function callNext() {
        return promiseFunc.apply(null, paramsGetter())
            .then(eachFunc);
    }
    function loop(promise, fn) {        
        return promise
            .then(fn)
            .then(function(condition) {
                if (!condition) {
                    return true;
                }
                return loop(callNext(), fn);
            });
    }
    return loop(callNext(), conditionChecker);
}

//api ajax call github generic
function Api(method, url, callback, data, raw) {
  url = 'https://api.github.com' + url;
  url += ((/\?/).test(url) ? '&' : '?');
  url += '&' + (new Date()).getTime();

  if(data && Object.keys(data).length > 1){
    data = JSON.stringify(data)
  }
  
  $.ajax({
    type: method,
    url: url,
    data: data,
    dataType: 'json',
    beforeSend: function(xhrObj){
      xhrObj.setRequestHeader('Accept','application/vnd.github.v3+json');
      xhrObj.setRequestHeader('Content-Type','application/json;charset=UTF-8');
      xhrObj.setRequestHeader('Authorization', 'token ' + $.trim(AccessToken));
    },
    success: function(data) {
      callback(data)
    },
    error: function(data, argument2, argument3) {
      callback(data.status);
    }
  });
  
}


//passage par ajax, pb avec api octokat, voir avec update distrib
function GetDateSinceUpdateOnMaster(callback) {
	Api('GET', '/repos/'+UserLogin+'/'+Git_repoName+'/branches/'+Git_refs_heads_master, function(data) {
      callback(data.commit.commit.committer.date);
    });
};
function GetCommitsSince(_datesince,callback) {
	Api('GET', '/repos/'+UserLogin+'/'+Git_repoName+'/commits?sha='+Git_refs_heads+'&since='+_datesince, callback);
};

//DELETE /repos/octocat/Hello-World/git/refs/heads/feature-a
// function DeleteBranchUpdate(callback) {
// 	Api('DELETE', '/repos/'+UserLogin+'/'+Git_repoName+'/git/refs/heads/'+Git_refs_heads, callback);
// };