# NodeJekyllCEV0.1-agency_ext


Custom editor for Jekyll project [**agency_ext**](https://github.com/admien33/agency_ext)

From browser, edit md files hosted on github server.

## Main parts

- Node express server + frontend to communicate with github server (main tools: ApiGithubV3 Rest, NodeGit, Octokat, uws, moment, JQuery, Bootstrap, [Sortable](https://github.com/RubaXa/Sortable), CKEditor4, SimpleMde, Dropzone)

- Jekyll preview site agency_ext with commits on branch update

- Jekyll production site agency_ext used to update gh-pages when merging on branch master (replace loop CI travis, integrated but not used anymore)



## Installation on local desktop, Ubuntu 16.04


### Env : 

- Ubuntu 16.04 desktop with nodejs(here, 6.11.3 lst), npm + env Jekyll, see [agency_ext](https://github.com/admien33/agency_ext)

- get [Personal access tokens](https://github.com/settings/tokens) - repo access

- fork Jekyll project [agency_ext](https://github.com/admien33/agency_ext)




### Installation server
	
	mkkdir ~/Jekyll
	git clone https://github.com/admien33/NodeJekyllCEV0.1-agency_ext ~/Jekyll/Node
	cd ~/Jekyll/Node
	npm install

	Custom config, see next
	# note : delete branch update of github's repo agency_ext if some ahead commits on branch master (modif outside editor) 
	node ~/Jekyll/Node/server.js

	# mess : Welcome user. Server listening..
	# then
	# connexion client, Chrome :  http://127.0.0.1:8080/, reload if necess
	# mess : InitNodegit: start cloning project. Please Wait...
	# mess : InitNodegit:clone & config ready (tp:5887). You can reboot the server.
	# then ctrl+c
	# reload if mess : (node:1426) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 1): Error: {"message":"Reference already exists","documentation_url":"https://developer.github.com/v3/git/refs/#create-a-reference"}


### Custom server configuration, LOCAL :

files ~/Jekyll/Node/server.js && ~/Jekyll/Node/public/config_agency_ext.js :

	var AccessToken = 'your_pers_access_token'; // !! not commit
	var Git_email = 'your_git_email@gmail.com';
	

## Start editor locally

### launched the preview site and redirect log

on a new Terminal window :

	cd ~/Jekyll/site_local && bundle exec jekyll serve -w >> ../sites_log/site_local.log

### launched the production site and redirect log

on a new Terminal window :

	cd ~/Jekyll/site_prod_local && bundle exec jekyll build -w >> ../sites_log/site_prod_local.log


### start the server and connect browser

on a new Terminal window :

	node ~/Jekyll/Node/server.js

	# connexion client, Chrome :  http://127.0.0.1:8080/, reload if necess

#### Note 

	- when you delete update on editor, you must restart the 3 process


### embedded on a Virtualbox

	- multi-OS, easy-use, no network configuration required.

	- services on boot with systemd, syslog

	- detailed procedure. todo.


## Remarks

- design based on bootstrap.3.3.6, starting from MeetHyde/MeetHyde 
