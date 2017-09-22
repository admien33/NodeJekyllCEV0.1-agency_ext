//variable init : recopy part /public/js//config_{username}_{repo}.js octokat!
var AccessToken = 'your_pers_access_token';// !! not commit
var Git_email = 'your_git_email@gmail.com';
var Git_repoName = 'agency_ext';
var base_url='/agency_ext';
var PathImageRef='images';

//reglage admin
var modedbg=false;
var Git_refs_heads = 'update';
var Git_refs_heads_prod = 'gh-pages';
var Git_refs_heads_master = 'master';
var Git_remote_ref = 'origin';
var Git_remote_deploy = 'upstream';
var folderSiteJekyll = '_site';
var folderAssetsJsJekyll = 'assets-js';
var pathSiteLocal = '../site_local/';
var pathSiteProdLocal = '../site_prod_local/';
var pathSiteRefMasterLocal = '../site_local_ref_master/';
var pathSitesLog = '../sites_log/';
var log_sitelocal = 'site_local.log';
var log_siteprodlocal = 'site_prod_local.log';
var pathLibCollExt = '../Lib_coll_ext/';
var pathgitLibCollExt = undefined;
var pathgitSiteLocal = undefined;
var pathgitSiteProdLocal = undefined;
var pathgitSiteRefMasterLocal = undefined;
var pathgitSitesLog = undefined;
var tmp_path_lib_coll_ext = '_includes/coll_ext';

//Note sites_log,
// bundle exec jekyll build -w >> ../sites_log/site_prod_local.log
// bundle exec jekyll serve -w >> ../sites_log/site_local.log


// load lib; init express local server, editor on port 8080
const http = require('http');
const express = require('express');
const path = require('path');
var app = express();
var WebSocketServer = require('uws').Server;

app.use(express.static(path.join(__dirname, '/public')));
var server = http.createServer(app);
server.listen(8080);

//++++++++++++++++++++
// nodegit + octokat
var nodegit = require("nodegit");
var Octokat = require('octokat');

const promisify = require("promisify-node");
const fs = require('fs');
const fse = promisify(require("fs-extra"));
const moment = require('moment')



var octo = new Octokat({
  token: AccessToken
});
var octoRepo;
//Current user
function CurrentUserOcto(callback) {
  octo.user.fetch(callback);
}

var UserLogin;//vargl
var RepoUrl;
var RemoteUrl;
var CurrentRefsHeadsCommitSha=null; //vargl
var CurrentRefsHeadsMasterCommitSha=null; //vargl
var BranchUpdate_onStart=true;//vargl

// function InitOctokatFirst(err,data) {
function InitOctokatFirst(err,data) {

  pathgitLibCollExt=path.join(__dirname, pathLibCollExt);
  pathgitSiteLocal=path.join(__dirname, pathSiteLocal);
  pathgitSiteProdLocal=path.join(__dirname, pathSiteProdLocal);
  pathgitSiteRefMasterLocal=path.join(__dirname, pathSiteRefMasterLocal);
  pathgitSitesLog=path.join(__dirname, pathSitesLog);
  if(modedbg===true) console.log('pathgitSiteProdLocal  :'+pathgitSiteProdLocal);
  

  UserLogin = data.login;

  console.info('Welcome '+UserLogin+'. Server listening..');


  //init octo in current rep, with access token
  octoRepo=octo.repos(UserLogin,Git_repoName);
  RepoUrl = "https://github.com/" + UserLogin.toLowerCase() + "/" + Git_repoName + ".git";
  // RemoteUrl="https://"+AccessToken+"@github.com/" + UserLogin.toLowerCase() + "/" + Git_repoName + ".git";
  RemoteUrl="https://github.com/" + UserLogin.toLowerCase() + "/" + Git_repoName + ".git";

  if(modedbg===true) console.log('RepoUrl :'+RepoUrl);
  if(modedbg===true) console.log('RemoteUrl :'+RemoteUrl);

  var last_date_commit_master=null;
  var last_date_commit_update=null;
  
  // get the current commit id of refs heads master
  octoRepo.git.refs.heads(Git_refs_heads_master).fetch(function (err, val) {  
    CurrentRefsHeadsMasterCommitSha=val.object.sha;
    CurrentRefsHeadsCommitSha=val.object.sha; 
    //info date commit master
    octoRepo.commits(CurrentRefsHeadsMasterCommitSha).fetch(function (err, val) {
      last_date_commit_master=moment(val.commit.committer.date).format();
      if(modedbg===true){ console.log('err : ' +err+', val : '+last_date_commit_master);}
      //get current commit id of branche Git_refs_heads, default 'update'
      octoRepo.git.refs.heads(Git_refs_heads).fetch(function (err, val) {
        // console.log('err : ' +err+', val : '+val);
        if(val===undefined) 
        {
          if(modedbg===true) console.log("force clone!")
          BranchUpdate_onStart=false;
        } 
        else
        {
          CurrentRefsHeadsCommitSha=val.object.sha;
          //info date commit master
          octoRepo.commits(CurrentRefsHeadsCommitSha).fetch(function (err, val) {
            last_date_commit_update=moment(val.commit.committer.date).format();
            if(modedbg===true) console.log('err : ' +err+', date update : '+last_date_commit_update);
            if(modedbg===true) console.log('err : ' +err+', date master : '+last_date_commit_master);
            //moment
            if(!moment(last_date_commit_master).isSameOrBefore(last_date_commit_update))
            {
              if(modedbg===true) console.log("commits ahead in master compare to branch update ! ");
              if(modedbg===true) console.log('V1 delete update branch, then recreate on load web api');
              if(modedbg===true) console.log("next V2 test pull, multi-user, show conflict..");
              
              octoRepo.git.refs.heads(Git_refs_heads).remove()
              .then(function(val) {
                if(val===true)
                {
                  BranchUpdate_onStart=false;
                  if(modedbg===true) console.log("done!");
                } 
              });
            } //end !moment(..).isSameOrBefore
          });
        } //end test (val===undefined)                    
      });
    });
  }); 
  
}
// info : test presence branch update when start server, before client API create one onload()
CurrentUserOcto(InitOctokatFirst);

function InitOctokat(err,data) {

  // get the current commit id of refs heads master
  octoRepo.git.refs.heads(Git_refs_heads_master).fetch(
    function (err, val) {
      
      CurrentRefsHeadsMasterCommitSha=val.object.sha;
      CurrentRefsHeadsCommitSha=val.object.sha;     

      octoRepo.git.refs.heads(Git_refs_heads).fetch(
        function (err, val) {
          if(val!==undefined) {
            CurrentRefsHeadsCommitSha=val.object.sha;
            if(CurrentRefsHeadsCommitSha !== CurrentRefsHeadsMasterCommitSha)
            {
              if(modedbg===true) console.log('branch update with commits to merge');
            }
            else {
              if(modedbg===true) console.log('branch update with no commits');              
            }
            InitNodegit(false);
          }
          else {
            octoRepo.git.refs.create({ref: 'refs/heads/'+Git_refs_heads, sha: CurrentRefsHeadsMasterCommitSha}).then(
              function(){
                if(modedbg===true) console.log('branch update created from master');
                InitNodegit(true);
              }
            );          
          }         
        }
      );
    }
  );  
  
}




//init nodegit, clone repo, branch Git_refs_heads , if needed
function InitNodegit(_createbranch) 
{
  var t1,t2;    
  if(_createbranch===true || (BranchUpdate_onStart===false))
  { 
  t1 = moment();
  console.info("InitNodegit: start cloning project. Please Wait...");
  BranchUpdate_onStart=true;
  CloneGitRepo(function(err){
    t2 = moment();
    if (err !== 0) 
    { 
      console.error('InitNodegit: something borked during clone! Contact your admin.');
    }else {
      console.info('InitNodegit: clone & config ready (tp:'+t2.diff(t1)+'). You can reboot the server.');
    }     
  }); 
  }
  else
  {
    console.info('InitNodegit: ready, do nothing');   
  }
}






//+++++++++++++++++++++++++++++++++++++++++
// GESTION git repo
//port fixé ! voir public/js/js.js
var wssGit = new WebSocketServer( { port: 8100 } );

wssGit.on('connection', function (ws) 
{
  if(modedbg===true) {console.log("wssGit, Browser connected online...");}
  CurrentUserOcto(InitOctokat);

  ws.on("message", onMessageGit)  

  ws.on("close", function() {
    if(modedbg===true){ console.log("wssGit, Browser gone.");}
  })
});

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// GESTION localpreview site, available or not ?
// wss to update button preview, enabled or disabled, on editor
var wssPreview = new WebSocketServer( { port: 8101 } );
var id_interval_preview=undefined;//vgl

function onMessagePreview(message) {
  var ob = JSON.parse(message);
  var that = this;

  if(ob.type==='text') 
  {
    if(ob.content==='Stop_interval_preview') 
    {
      clearInterval(id_interval_preview);
    }
    else if(ob.content==='Interval_preview_init') 
    {
      id_interval_preview = setInterval(onIntervalPreviewState, 1000, that);
    }   
    else if(ob.content==='Waiting_preview_build_ready') 
    {
      console.log('mess Waiting_preview_build_ready received');
      isPreviewBuildReady(that);
    }     
  }
}

function onIntervalPreviewState (_ws) 
{
  var options = {method: 'HEAD', host: '127.0.0.1', port: 4000, path: base_url+'/'};
  var req = http.request(options, function(r) {
    // if(modedbg===true) {console.log(JSON.stringify(r.headers));}
    if (r.headers['etag']!==undefined) 
    {
      setTimeout(function() {
        _ws.send('{ "type":"text", "content":"preview_ready"}', function () { /* ignore errors */ });
      }, 50);       
    }
    else {
      setTimeout(function() {
    _ws.send('{ "type":"text", "content":"preview_awaiting_must_restart"}', function () { /* ignore errors */ });
    }, 50);   
    }    
  });
  req.on('error', function(err) {
    // Handle error
    setTimeout(function() {
    _ws.send('{ "type":"text", "content":"preview_awaiting_construction"}', function () { /* ignore errors */ });
    }, 50);   
  });
  req.end();
}

function isPreviewBuildReady (_ws) 
{
  fse.pathExists(pathgitSitesLog+log_sitelocal,function(err,exists) {
    if (exists) {
      BuildReadyToDeploy(pathgitSitesLog+log_sitelocal,1, function(value){
        if (value===1) 
        {
          setTimeout(function() {
        _ws.send('{ "type":"text", "content":"preview_build_ready"}', function () { /* ignore errors */ });
        }, 50); 

        }
        else {
          setTimeout(function() {
        _ws.send('{ "type":"text", "content":"preview_build_not_ready"}', function () { /* ignore errors */ });
        }, 50); 
        BuildReadyToDeploy(pathgitSitesLog+log_sitelocal,log_build_max_iter, function(){
            setTimeout(function() {
          _ws.send('{ "type":"text", "content":"preview_build_ready"}', function () { /* ignore errors */ });
          }, 50);       
          });
        }             
      });     
    }
    else
    {
      setTimeout(function() {
    _ws.send('{ "type":"text", "content":"preview_build_ready"}', function () { /* ignore errors */ });
    }, 50);
    }
    
  }); 

}

wssPreview.on('connection', function (ws) 
{
  if(modedbg===true) console.log("wssPreview,Browser connected online...")  
  id_interval_preview = setInterval(onIntervalPreviewState, 1000, ws);
  ws.on("message", onMessagePreview)  
  ws.on("close", function() 
  {
    if(modedbg===true) console.log("wssPreview, Browser gone.")
  })
});






// ---------------------------
// wssGit socket subfunctions
//----------------------------

var that_git;
function onMessageGit(message) 
{
  var ob = JSON.parse(message);
  that_git = this;
  var t1,t2;

  if(ob.type==='text') 
  {
    if (ob.content==='Update_git') 
    {
      if(modedbg===true) {console.log('Update_git in');}
      t1 = moment();
      UpdateGitRepo(pathgitSiteLocal,function(){
        //send message preview_under_build, filtered on interface
        setTimeout(function() {
        that_git.send('{ "type":"text", "content":"git_preview_under_build"}');
      }, 50);
        UpdateGitRepo(pathgitSiteProdLocal,function(){
          t2 = moment();
          if(modedbg===true) {console.log('Update_git done, time process : '+ t2.diff(t1) );}

          

        });
      });

    } // end if (ob.content==='Update_git')
    else if((ob.content==='Reinit_git') || (ob.content==='Reinit_force_clone'))
    {
      if(modedbg===true) {console.log(ob.content+' in');}

      octoRepo.git.refs.heads(Git_refs_heads_master).fetch(
        function (err, val) {
          
          CurrentRefsHeadsMasterCommitSha=val.object.sha;
          CurrentRefsHeadsCommitSha=val.object.sha;         

          var promUpdateBranch = new Promise(function(resolve) {
            octoRepo.git.refs.heads(Git_refs_heads)
            .fetch(function (err, val) {
              if(val!==undefined) 
              {
                CurrentRefsHeadsCommitSha=val.object.sha;
                resolve();
              }
              else 
              {
                octoRepo.git.refs.create({ref: 'refs/heads/'+Git_refs_heads, sha: CurrentRefsHeadsMasterCommitSha})
                .then(function() {
                  if(modedbg===true){ console.log(ob.content+' - branch update created from master');}
                  resolve();
                });
              }         
            });
          });
          promUpdateBranch.then(function() {

            var promBuildReady = new Promise(function(resolve) {    
            t1=moment();
              fse.pathExists(pathgitSitesLog+log_siteprodlocal,function(err,exists) {
                if (exists) 
                {
                  BuildReadyToDeploy(pathgitSitesLog+log_siteprodlocal,log_build_max_iter, function(){
                    t2 = moment();
                    if(modedbg===true) {console.log(ob.content+' - build_ready, time process : '+ t2.diff(t1) );}
                    resolve();
                  });
                } else {
                  resolve();
                }
              });       
            });
            promBuildReady.then(function() {
              t1=moment();
              if (ob.content === 'Reinit_force_clone') 
              {
                CloneGitRepo(function(){
                  t2=moment();
                console.info('Reinit_force_clone - done (tp:'+ t2.diff(t1)+'). You can reboot the server.');
                setTimeout(function() {
                  that_git.send('{ "type":"text", "content":"git_repo_ready"}');
                }, 50);
                });
              }
              else if (ob.content === 'Reinit_git') 
              {
                ReinitGitRepo(function(){
                  t2=moment();
                console.info('Reinit_Git - done (tp:'+ t2.diff(t1)+'). You can reboot the server.');
                setTimeout(function() {
                  that_git.send('{ "type":"text", "content":"git_repo_ready"}');
                }, 50);
                });
              }
            });// end promBuildReady.then
          });// end promUpdateBranch.then
        }
      );
      
    } // end if (ob.content==='Reinit_git')
    else if(ob.content==='Update_production_git') 
    {
      if(modedbg===true) {console.log('Update_production_git in');}

      var path_site_prod = pathgitSiteProdLocal + folderSiteJekyll;

      var promBuildReady = new Promise(function(resolve) {
        t1 = moment();
        fse.pathExists(pathgitSitesLog+log_siteprodlocal,function(err,exists) {
          if (exists) 
          {
            BuildReadyToDeploy(pathgitSitesLog+log_siteprodlocal,log_build_max_iter, function(){
              t2 = moment();
              if(modedbg===true) {console.log('Update_production_git - build ready, time process : '+ t2.diff(t1) );}
              resolve();
            });
          }else {
            resolve();
          }
        });       
      });

      promBuildReady.then(function() {

        var t1,t2;
        t1 = moment();
        var promImagemin = new Promise(function(resolve) {
          BuildProdImageMin(path_site_prod,function() {
            // if(modedbg===true) {console.log("minify image");}
          resolve();
          });
        });
        promImagemin.then(function() {          
          var promUglify = new Promise(function(resolve) {
            BuildProdUglify(path_site_prod,function() {
              // if(modedbg===true) {console.log("uglify image");}              
            resolve();
            });
          });
          promUglify.then(function() {
            if(modedbg===true) {console.log('Update_production_git - Start update git repos, please wait... ');}
            DeployProdGit(path_site_prod,function() {
              t2 = moment();
              if(modedbg===true) {console.log('Update_production_git done, time process : '+ t2.diff(t1) );}
              setTimeout(function() {
                that_git.send('{ "type":"text", "content":"git_production_ready"}', function () { /* ignore errors */ });
              }, 50);
            });
          }); //end promUglify.then(

        }); //end promImagemin.then(
      }); //end promBuildReady.then(
      
    } // end if (ob.content==='Update_prReinit_gitoduction_git')

  }   
}

// ----------------------------------
// InitGit, Reinit_git subfunctions
//-----------------------------------

// var_gl "that_git" when not _first_init
// _first_init = false, not used, remplaced with ReinitGitRepo()
function CloneGitRepo(callback)
{
  var opts = {
  fetchOpts: {
    callbacks: {          
      certificateCheck: function() { return 1;}
    }
  },
  checkoutBranch : Git_refs_heads
  };

  fse.remove(pathgitSiteLocal)
  .then(function() {

  //extra, ensure dir to access build log jekyll servers
  fse.ensureDirSync(pathgitSitesLog);
  //
    nodegit.Clone(RepoUrl, pathgitSiteLocal, opts)
    .catch(function(err) { console.log(err); })
    .done(function(repo){
      if (repo instanceof nodegit.Repository) 
      {
        // var path_site_lib = pathgitSiteLocal + tmp_path_lib_coll_ext;
        // var path_lib = pathgitLibCollExt + tmp_path_lib_coll_ext;

        // return fse.copy(path_lib,path_site_lib)
        // // add site_prod_local folder
        // .then(function() {
        //     return fse.remove(pathgitSiteProdLocal);
        //   })
        //comment add private lib CE
        return fse.remove(pathgitSiteProdLocal)
        .then(function() {          
          return fse.copy(pathgitSiteLocal,pathgitSiteProdLocal);
        })
        // add site_ref_master_local folder
        .then(function() {
            return fse.remove(pathgitSiteRefMasterLocal);
          })
        .then(function() {          
          return fse.copy(pathgitSiteLocal,pathgitSiteRefMasterLocal);
        })
        .then(function() {
          callback(0);        
            //end last part
        });   
        
    }
    else {
      callback(1);        
    }
    
    });//end done of nodegit.Clone branch site_local update on pathgitSiteLocal

  });       

}

// var_gl "that_git" when not _first_init
function ReinitGitRepo(callback)
{

  var _repository,_index,_branchHeadCommit;
  var folder_git = '/.git';
 
  fse.remove(pathgitSiteLocal)
  .then(function() {
  return fse.copy(pathgitSiteRefMasterLocal,pathgitSiteLocal);
  })
  .then(function() {
  return fse.remove(pathgitSiteLocal+'/'+folderSiteJekyll);
  })
  .then(function() {
  return fse.remove(pathgitSiteLocal+folder_git);
  })  
  .then(function() {
  return nodegit.Repository.init(pathgitSiteLocal, 0);          
  })
  .then(function(repo) {
    _repository = repo;
    return nodegit.Remote.create(_repository, Git_remote_ref, RemoteUrl); 
  })
  .then(function(remoteResult) {
    return _repository.fetch(Git_remote_ref, {
    callbacks: { certificateCheck: function() { return 1;} }
    });      
  })
  .then(function() {      
    return _repository.getBranchCommit(Git_remote_ref+'/'+Git_refs_heads);
  })
  .then(function(branchHeadCommit) {
    _branchHeadCommit=branchHeadCommit;   
    return _repository.refreshIndex();
  })
  .then(function(idx) {
    _index=idx;
  return _index.addAll();
  })
  .then(function() {
    return _index.write();
  })
  .then(function() {
    return _index.writeTree();
  })
  .then(function() {
    return _repository.createBranch(Git_refs_heads, _branchHeadCommit)
   })
  .then(function() {
    var opts = {checkoutStrategy: nodegit.Checkout.STRATEGY.FORCE};
    return _repository.checkoutBranch(Git_refs_heads,opts);
  })
  .then(function() {
    return _repository.mergeBranches(Git_refs_heads,Git_remote_ref+'/'+Git_refs_heads);
  })
  .then(function() {
    return fse.remove(pathgitSiteProdLocal);
  })
  .then(function() {
  return fse.copy(pathgitSiteLocal,pathgitSiteProdLocal);
  })  
  .then(function() {
  callback();     
  });
}

// -----------------------------------
// Update_git subfunctions
// -----------------------------------
function UpdateGitRepo(_path_repo,callback) {

  
  var _repository;

  fse.ensureDir(_path_repo,function() {
    //pull, adapted from https://github.com/nodegit/nodegit/blob/master/examples/pull.js
    nodegit.Repository.open(_path_repo)
    .then(function(repo) {
      _repository = repo;
      t1=moment();
      return _repository.fetch(Git_remote_ref,{
        callbacks: {certificateCheck: function() {return 1;}}
      });
    })        
    // Now that we're finished fetching, go ahead and merge our local branch
    // with the new one
    .then(function() {      
      var opts = {checkoutStrategy: nodegit.Checkout.STRATEGY.FORCE};
      // return _repository.checkoutBranch(Git_refs_heads,opts);
      return _repository.checkoutBranch(Git_refs_heads,opts);
    })
    .then(function() {      
      var ourSignature = nodegit.Signature.now(UserLogin,Git_email);
      return _repository.mergeBranches(
        Git_refs_heads, 
        Git_remote_ref+'/'+Git_refs_heads,  
        ourSignature,
    nodegit.Merge.PREFERENCE.FASTFORWARD_ONLY);
    })        
    .then(function() {  
      callback();
    });
  }); // end fse.ensureDir(_path_repo,

}

// -----------------------------------
// Update_production_git subfunctions
// -----------------------------------
var log_build_max_iter = 50;
var log_build_period_iter = 500;
var log_build_match_done = ['...done in','Auto-regeneration: enabled','Server running...'];
//note path_log exists !
function BuildReadyToDeploy(path_log,max_iter=log_build_max_iter,callback){

  var data = fs.readFileSync(path_log,'utf8');
  var lines = data.split("\n");
  var line_ref_past = (lines.length>1)?lines[lines.length-2]:'';
  

  function IsReadyTest(_path_log,ref_past,_cpt_wait,callback) {

    var data = fs.readFileSync(_path_log,'utf8');
    var lines = data.split("\n");
    var ref_current = (lines.length>1)?lines[lines.length-2]:'';

    var match_log = log_build_match_done.length-1;
    log_build_match_done.forEach(function(value) {
      match_log +=  ref_current.indexOf(value);
    });
    if (match_log>-1 && ref_current===ref_past) 
    {
      //reinit log
      fs.writeFileSync(path_log, ref_current+'\n');
      callback(_cpt_wait);  
    } 
    else 
    {
      _cpt_wait--;
      if (_cpt_wait>0) 
      {
        
        ref_past=ref_current;
        setTimeout(IsReadyTest, log_build_period_iter,
          _path_log,ref_past,_cpt_wait,callback);
      } else {        
        callback(_cpt_wait);  
      }
    }             
  }

  setTimeout(IsReadyTest, log_build_period_iter, 
    path_log,line_ref_past,max_iter,callback);

}

function DeployProdGit(path_site_prod,callback) {
  
  var repository,remote,index,oid;
  var folder_git = '/.git';


  fse.remove(path_site_prod+folder_git)
  .then(function() {
    return nodegit.Repository.init(path_site_prod, 0);
  })
  .then(function(repo) {
    repository = repo;      
    return nodegit.Remote.create(repository, Git_remote_deploy, RemoteUrl);   
  })
  .then(function(remoteResult) {
    remote = remoteResult;
    return repository.fetch(Git_remote_deploy, {
    callbacks: { certificateCheck: function() { return 1;} }
  });
  // http://gitready.com/intermediate/2009/02/13/list-remote-branches.html
  // cmd : git branch -a ; git branch -r, git remote show upstream ;  git ls-remote --heads upstream
  })
  .then(function() {
    return repository.getBranchCommit(Git_remote_deploy+'/'+Git_refs_heads_prod);
  })
  .then(function(branchHeadCommit) {
    return nodegit.Reset.reset(repository, branchHeadCommit, nodegit.Reset.TYPE.SOFT);
  })      
  .then(function(){
    return repository.refreshIndex();
  })
  .then(function(idx) {
    index=idx;
  return index.addAll();
  })
  .then(function() {
    return index.write();
  })
  .then(function() {
    return index.writeTree();
  })
  .then(function(oidResult) {
    oid = oidResult;
    return nodegit.Reference.nameToId(repository, "HEAD");
  })
  .then(function(head) {
    return repository.getCommit(head);
  })
  .then(function(parent) {
    var author = nodegit.Signature.now(UserLogin,Git_email);
    var committer = nodegit.Signature.now(UserLogin,Git_email);  
    return repository.createCommit("HEAD", author, committer, "build", oid, [parent]);
  })    
  .then(function() {      
    var refs = ['refs/heads/'+Git_refs_heads_master+':refs/heads/'+Git_refs_heads_prod];
    var options = {
      callbacks: {
      credentials: function(url, userName) {
        return nodegit.Cred.userpassPlaintextNew(AccessToken, "x-oauth-basic");
      },
      certificateCheck: function() {return 1;}
      }
    };
    return remote.push(refs, options);
  })  
  // rm -fr .git
  .then(function() {
    return fse.remove(path_site_prod+folder_git);
  })
  //update site_local_ref_master to last master
  .then(function(){
    return fse.remove(pathgitSiteRefMasterLocal)    
  })
  .then(function() {
  return fse.copy(pathgitSiteLocal,pathgitSiteRefMasterLocal);
  })  
  .then(function() {
    callback(); 
  });
  //note ~ deploy.sh CI travis

}
//
function BuildProdImageMin(path_site_prod,callback) {

  //imagemin step before commit production site on gh-pages
  const imagemin = require('imagemin');
  const imageminJpegtran = require('imagemin-jpegtran');
  const imageminPngquant = require('imagemin-pngquant');
  const dir = require('node-dir');

  var path_img_output = path_site_prod + '/build-'+PathImageRef.toLowerCase();  

  dir.subdirs(path_site_prod+'/'+PathImageRef,  function(err, subdirs) {

    WaterfallOver(subdirs,
      function(path_subdir, report) //iterator
      {
        var path_img_input = path_subdir + '/*.{jpg,png}';        

        imagemin([path_img_input],path_img_output, {
          plugins: [
            imageminJpegtran(),
            imageminPngquant({quality: '65-80'})
          ]
        })
        .then(function(files) {
          // console.log(files);
          //=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
          files.forEach(function(file_info) {
            var image_name = file_info.path.substring(file_info.path.lastIndexOf('/')+1);                 
            path_temp = path_subdir+'/'+image_name;
            fse.outputFileSync(path_temp, file_info.data);

          });
          fse.remove(path_img_output, function(err){
            report(); 
          });
        });    
      }, 
      callback      
    );
  });
}
//
function BuildProdUglify(path_site_prod,callback) {

  //imagemin step before commit production site on gh-pages
  const uglifyJs = require('uglify-js');
  const dir = require('node-dir');

  dir.readFiles(path_site_prod+'/'+folderAssetsJsJekyll, 
    {
    match: /.js$/,
    recursive: true
  }, function(err, content, filename, next) {
    if (err) console.log('err : '+ err);
    var result = uglifyJs.minify(content, {fromString: true}).code;
    fse.outputFileSync(filename, result);
    next();
  },
  function(err, files){
    if (err) console.log('err : '+ err);
    callback();
  }
  );

}

// https://mostafa-samir.github.io/async-iterative-patterns-pt1/
function WaterfallOver(list, iterator, callback) {

  var nextItemIndex = 0;  //keep track of the index of the next item to be processed
  function report() 
  {
    nextItemIndex++;
    // if nextItemIndex equals the number of items in list, then we're done
    if(nextItemIndex === list.length)
    { 
      callback();
    }else {
      // otherwise, call the iterator on the next item
      iterator(list[nextItemIndex], report);
    }         
  }
  // instead of starting all the iterations, we only start the 1st one
  iterator(list[0], report);
}

