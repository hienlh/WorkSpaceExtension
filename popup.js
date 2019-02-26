let submitButton = document.getElementById('submit');
let workspaceList = document.getElementById('WorkspaceList');
let urlList = document.getElementById('url-list');
let notification = document.getElementById('notification');
var workspaces = {};

UpdateWorkspaceListView();

submitButton.addEventListener("click", function() {
    let key = document.getElementById('name').value;
    if(key === '') return;

    GetCurrentTabs((tabs)=>{
        chrome.storage.sync.set({ [key] : tabs});
    })
    
    if(workspaces[key] === undefined)
    {
        workspaces[key] = key;
        let id = 'workspace-' + key;
        UpdateWorkspaceListView();
        chrome.storage.sync.set({ workspaces : workspaces});
        document.getElementById('notification').innerHTML = 'submited';
    }
});

workspaceList.onchange = UpdateUrlList;

function UpdateUrlList(){
    var tmp = '';
    chrome.storage.sync.get([workspaceList.value], (result)=>{
        let list = result[workspaceList.value];
        for(let i = 0 ; i < list.length; ++i){
            let url = list[i]
            tmp += '<li class="mdl-list__item" id="' + url + '">' + extractHostname(url) + '</li>'
        }
        urlList.innerHTML = tmp;
    });
}

document.getElementById('open-workspace').onclick = function(){
    chrome.storage.sync.get([workspaceList.value], (result)=>{
        chrome.windows.create({url: result[workspaceList.value]});
    });
};

document.getElementById('remove-workspace').onclick = function(){
    notification.innerHTML = workspaces[workspaceList.value];
    delete workspaces[workspaceList.value];
    chrome.storage.sync.set({ workspaces : workspaces}, ()=>{    
        UpdateWorkspaceListView();
    });
};

function UpdateWorkspaceListView(){
    WorkspaceList.innerHTML = ''; //Clear view

    chrome.storage.sync.get('workspaces', function(result) {
        if(Object.keys(result).length !== 0) //Check result != empty object
            workspaces = result.workspaces;
    
        Object.keys(workspaces).forEach((workspace)=>{
            AppendWorkspace(workspace);
        });
    });
    UpdateUrlList();
}

function AppendWorkspace(workspace){
    var innerWorkspaceList = WorkspaceList.innerHTML;
    innerWorkspaceList += '<option value="' + workspace + '">' + workspace + '</option>'
    workspaceList.innerHTML = innerWorkspaceList;

    // let id = 'workspace-' + workspace;
    // chrome.storage.sync.get([workspace], (result)=>{
    //     result[workspace].forEach((item)=>{
    //         InsertIntoList('li', id, item);
    //     })
    // });
}

function InsertIntoList(nodeType, parentId, name, id = null) {
    var node = document.createElement(nodeType);
    var textnode = document.createTextNode(name);
    if(id) node.setAttribute("id", id);
    node.appendChild(textnode);
    document.getElementById(parentId).appendChild(node);
}

function GetCurrentTabs(callback){
    chrome.windows.getCurrent(function(win){
        let tabUrls = [];
        chrome.tabs.getAllInWindow(win.id, function(tabs){
            for(let i = 0; i < tabs.length; ++i){
                tabUrls.push(tabs[i].url);
            }

            return callback(tabUrls);
        })
    })
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}