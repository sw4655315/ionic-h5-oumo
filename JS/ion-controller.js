!function(win,undefined) {    

    angular.module('axibar.controller', [])
    .controller('appCtrl', function($sce,$rootScope,$scope,$ionicModal,$kit) {
        $rootScope.shareShow = {
            weixin:true,
            sina:true,
            qq:true,
            qzone:true,
            collect:true,
            report:true
        }
        $ionicModal.fromTemplateUrl('shareModal.html', {
            scope: $rootScope
        }).then(function(modal) {
            $rootScope.shareModal = modal;
            var shareConfig = {appkey: '1362d982e489b'};
            var collectParas = {};
            /**
             * 弹出分享框
             * @param  {array} share   分享的数据 ['type',{obj}]
             * @param  {array} collect 收藏的数据 ['type',{obj}]
             * @param  {array} hide    需要隐藏的按钮 ['report','collect']
             */
            $rootScope.shareModal.alert = function(share,collect,hide){
                shareConfig.params = getParams(share);
                mobShare.config(shareConfig);
                hideBtn(hide);
                collectParas.collect = collect;
                collectParas.paras = getCollectParas(collect);
                $rootScope.shareModal.show();
            }
            $rootScope.shareModal.share = function(op){
                $rootScope.shareModal.hide();
                switch(op){
                    case 'weixin':
                        mobShare('weixin').send();
                        break;
                    case 'sina':
                        mobShare('weibo').send();
                        break;
                    case 'qq':
                        mobShare('qq').send();
                        break;
                    case 'qzone':
                        mobShare('qzone').send();
                        break;
                    case 'collect':
                        if($kit.isEmpty($kit.getSessionid())){
                            $kit.go(['login']);
                            return false;
                        }
                        $kit.autoPost('appcollection/update',collectParas.paras,function(json){
                            if(collectParas.paras.op == '1'){
                                collectParas.collect[1].collected = '1';
                                $kit.alert('收藏成功');
                            }else{
                                collectParas.collect[1].collected = '0';
                                $kit.alert('取消收藏');
                            }
                        })
                        break;
                    default:
                        if($kit.isEmpty($kit.getSessionid())){
                            $kit.go(['login']);
                            return false;
                        }
                        $kit.alert('谢谢你的举报！我们会尽快处理');
                        break;
                }
            }
            function getParams(paras){
                var type = paras[0];
                switch(type){
                    case 'detail':
                        return {
                                url: axibar.page_port + 'detail/'+paras[1].ids, // 分享链接
                                title: paras[1].title, // 分享标题
                                description:paras[1].summary,
                                pic:paras[1].photo
                            };
                        break;
                    case 'channel':
                        return {
                            url: axibar.page_port + 'channel/1/'+paras[1].ids+'/'+paras[1].name, // 分享链接
                            title: paras[1].name, // 分享标题
                            description:paras[1].summary,
                            pic:paras[1].photo
                        };
                        break;
                }
            }

            function hideBtn(hide){
                if(!$kit.isEmpty(hide)){
                    for (var i = hide.length - 1; i >= 0; i--) {
                        $rootScope.shareShow[hide[i]] = false;
                    };
                }
            }

            function getCollectParas(paras){
                var type = paras[0];
                var res = {
                    collectedids:paras[1].ids
                    ,op:paras[1].collected == '1'? '2':'1'
                    ,sessionid:$kit.getSessionid()
                    ,type:'1'
                }
                if(type == 'channel'){
                    res.type='2';
                }
                return res;
            }
        });
    })

    /**
     * 首页
     * @param  {[type]} $scope           [description]
     * @param  {[type]} $stateParams     [description]
     * @param  {[type]} $kit             [description]
     */
    .controller('indexCtrl', function($scope,$stateParams,$kit,$state,$sessionStorage,$ionicModal,$ionicSlideBoxDelegate) {
        var params = $stateParams;
        $scope.pageNumber = params.pageNumber || 0;
        $scope.classifyids = 'FL0001';
        $scope.play_index = -1;
        $scope.pmap = {};
        $scope.cmap = {};
        $scope.contentList = [];
        $scope.bannerList = [];
        $scope.load = function(pageNumber){
            $kit.autoPost('content',{classifyids:$scope.classifyids,pageNumber:$scope.pageNumber++,sessionid:$kit.getSessionid()},function(json){
                $scope.contentList = $scope.contentList.concat(json.content);
                $scope.page = json.page;
            });
        }
        $scope.loadBanner = function(){
            $kit.autoPost('banner/list',{},function(json){
                $scope.bannerList = $scope.bannerList.concat(json);
                $ionicSlideBoxDelegate.update();
            });
        }
        $scope.play = function(_index){
            $scope.play_index = _index;
        }
        /**
         * 跳转页面 - 播放停止
         */
        $scope.go = function(args){
            $scope.play_index = -1;
            $kit.go(args);
        }
        $scope.praised = function(contentids){
            $kit.togglePraised(contentids,$scope.pmap[contentids],function(){});
        }
        $scope.classify = function(classifyid){
            $scope.classifyids = classifyid;
            $scope.contentList = [];
            $scope.pageNumber = classifyid == 'FL0001' ? 0 : 1;
            $scope.load();
        }
        $scope.loadBanner();
        $scope.load();
    }) 

    /**
     * 频道列表
     * @param  {[type]} $scope           [description]
     * @param  {[type]} $stateParams     [description]
     * @param  {[type]} $kit             [description]
     */
    .controller('channelCtrl', function($scope,$stateParams,$kit,$state,$sessionStorage,$ionicModal) {
        $scope.para = $stateParams;
        var params = $stateParams;
        $scope.pageNumber = params.pageNumber || 1;
        $scope.channelids = params.ids;
        $scope.channelTitle = params.title;
        $scope.play_index = -1;
        $scope.pmap = {};
        $scope.contentList = [];
        $scope.load = function(pageNumber){
            $kit.autoPost('content',{channelids:$scope.channelids,pageNumber:$scope.pageNumber++,sessionid:$kit.getSessionid()},function(json){
                $scope.contentList = $scope.contentList.concat(json.content);
                $scope.page = json.page;
            });
        }
        $scope.play = function(_index){
            $scope.play_index = _index;
        }
        /**
         * 跳转页面 - 播放停止
         */
        $scope.go = function(args){
            $scope.play_index = -1;
            $kit.go(args);
        }
        $scope.praised = function(contentids){
            $kit.togglePraised(contentids,$scope.pmap[contentids],function(){});
        }
        $scope.load();
    })

    /**
     * 详情页
     * @param  {[type]} $scope       [description]
     * @param  {[type]} $stateParams [description]
     * @param  {[type]} $kit         [description]
     */
    .controller('detailCtrl', function($rootScope,$scope,$stateParams,$kit,$state,$sessionStorage) {
        $scope.params = $stateParams;
        $scope.commentList = [];
        $scope.playing = false;
        $scope.pageNumber = $stateParams.pageNumber || 1;
        $scope.sendInput = {
            placeHolder : '来留下你的爪印'
            ,focus:false
            ,for_user:''
            ,val:''
            ,refresh:function(){
                this.placeHolder = '来留下你的爪印';
                this.focus = false;
                this.for_user = '';
                this.val = '';
            }
        }
        $scope.menuToggle=false;
        $scope.toggleMenu = function(){
            $scope.menuToggle = !$scope.menuToggle;
        }
        $scope.loadContent = function(){
            $kit.autoPost('content/detail',{ids:$stateParams.contentids,sessionid:$kit.getSessionid()},function(json){
                $scope.channel = json.channelInfo;
                $scope.contents = json.contentInfo;
                $scope.praise = json.praiseInfo;
                $scope.pmap = {isPraised:$scope.contents.praised != 0,praiseInfo:$scope.praise};
            },function(){
                $scope.$broadcast('scroll.refreshComplete');
            });
        }
        $scope.loadComment = function(pageNumber){
            if(!$kit.isEmpty(pageNumber)){
                $scope.pageNumber = pageNumber;
            }
            $kit.autoPost('comment/list',{contentids:$stateParams.contentids,pageNumber:$scope.pageNumber++},function(json){
                $scope.commentList = $scope.commentList.concat(json.comment);
                $scope.page = json.page;
            });
        }
        $scope.play = function(){$scope.playing=true;}
        $scope.go = function(args){
            $scope.play_index = -1;
            $kit.go(args);
        }
        $scope.praised = function(contentids){
            $kit.togglePraised(contentids,$scope.pmap,function(){});
        }
        $scope.refresh = function(){
            $scope.params = $stateParams;
            $scope.menuToggle=false;
            $scope.commentList = [];
            $scope.playing = false;
            $scope.loadContent();
            $scope.loadComment(1);
        }

        $scope.reply = function(for_user){
            if($kit.isEmpty($rootScope.storage.user)){
                $scope.go(['login']);
                return false;
            }
            if(!$kit.isUids(for_user.ids)
                || $rootScope.storage.user.ids == for_user.ids){
                return false;
            }
            $scope.sendInput.placeHolder = '回复'+for_user.nickname;
            $scope.sendInput.focus = true;
            $scope.sendInput.for_user = for_user;
            var msg = document.getElementById("comment-msg");
            msg.value = '';
            msg.autofocus="autofocus";
        }
        $scope.sendMsg = function(){
            if($kit.isEmpty($rootScope.storage.user)){
                $scope.go(['login']);
                return false;
            }
            if($kit.isEmpty($scope.sendInput.val)){
                return false;
            }
            $kit.autoPost('comment/send',
            {
                contentids:$stateParams.contentids
                ,message:$scope.sendInput.val
                ,sessionid:$rootScope.storage.user.sessionid
                ,forids:$kit.isEmpty($scope.sendInput.for_user)?null:$scope.sendInput.for_user.ids
            },function(json){
                var obj = {
                    contentids:$stateParams.contentids
                    ,create_time:new Date()
                    ,id:0
                    ,message:$scope.sendInput.val
                    ,my_info:JSON.stringify($rootScope.storage.user)
                    ,other_info:$kit.isEmpty($scope.sendInput.for_user)?null:JSON.stringify($scope.sendInput.for_user)
                }
                $scope.commentList.unshift(obj);
                $scope.sendInput.refresh();
            });
        }
        //加载数据
        $scope.refresh();
    })

    /**
     * 登录页
     * @param  {[type]} $scope           [description]
     * @param  {[type]} $kit             [description]
     * @param  {[type]} $state           [description]
     * @param  {Object} $sessionStorage  [description]
     */
    .controller('loginCtrl', function($scope,$kit,$state,$sessionStorage) {
        $scope.loginForm = {};
        $scope.login = function(){
            if(!$kit.isMobile($scope.loginForm.mobile)){
                $kit.alert('请输入正确手机号');
                return false;
            }
            if(!$kit.isPwd($scope.loginForm.pwd)){
                $kit.alert('密码不符合要求');
                return false;
            }
            $kit.autoPost('user/login',$scope.loginForm,function(res){
                $sessionStorage.user = res.user;
                $sessionStorage.sessionid = res.user.sessionid;
                $kit.go(['back']);
            });
        }
    })

    /**
     * 注册
     * @param  {[type]} $scope                [description]
     * @param  {[type]} $stateParams          [description]
     * @param  {[type]} $interval             [description]
     * @param  {Object} $kit                  [description]
     */
    .controller('registerCtrl', function($scope,$stateParams,$interval,$kit) {
        $scope.form = {};
        //验证码请求，倒计时
        $scope.codeCountDown = function(type_str){
            if(!$kit.isMobile($scope.form.mobile)){
                $kit.alert('请输入正确手机号');
                return false;
            }
            $scope.count = 60;
            $interval(function(){
                $scope.form.txtAuthcode="请在" + --$scope.count + "秒内输入验证码";
            },1000,60).then(function(){
                $scope.form.txtAuthcode="重发验证码";
            });
            $kit.autoPost('user/getCaptcha',{mobile:$scope.form.mobile,type:type_str},function(res){});
        }
        //注册请求
        $scope.register = function(type_str){
            if(!$kit.isMobile($scope.form.mobile)){
                $kit.alert('请输入正确手机号');
                return false;
            }
            if(!$kit.isAuthCode($scope.form.authcode)){
                $kit.alert('验证码输入有误');
                return false;
            }
            if(!$kit.isPwd($scope.form.pwd)){
                $kit.alert('密码不符合要求');
                return false;
            }
            var url = type_str === 'register' ? 'user/register':'user/resetpwd';
            $kit.autoPost(url,$scope.form,function(res){
                $sessionStorage.user = res.user;
                $sessionStorage.sessionid = res.user.sessionid;
                $kit.go(['index']);
                // $state.go('app.index',{id:Math.random()});
            });
        }
        $scope.paras = $stateParams;
    })
/**
 * 频道简介
 * @param  {[type]} $scope           [description]
 * @param  {[type]} $kit             [description]
 * @param  {[type]} $state           [description]
 * @param  {[type]} $stateParams     [description]
 * @param  {[type]} $sessionStorage  [description]
 */
    .controller('channelInfoCtrl', function($scope,$kit,$state,$stateParams,$sessionStorage) {
        $scope.channelids = $stateParams.ids;
        $scope.channelTitle = $stateParams.title;
        $kit.autoPost('appchannel/info',{ids:$stateParams.ids,sessionid:$kit.getSessionid()},function(json){
            $scope.channel = json;
        })
    })
    /**
     * 消息页
     * @param  {[type]} $scope           [description]
     * @param  {[type]} $kit             [description]
     * @param  {[type]} $state           [description]
     * @param  {[type]} $sessionStorage  [description]
     */
    .controller('messageCtrl', function($scope,$kit,$state,$sessionStorage) {
        $scope.go = function(args){
            if($kit.isEmpty($sessionStorage.user)){
                $kit.go(['login']);
                return false;
            }
            $kit.go(args);
        }
    })

    /**
     * 个人页
     * @param  {[type]} $scope           [description]
     * @param  {[type]} $kit             [description]
     * @param  {[type]} $state           [description]
     * @param  {[type]} $stateParams     [description]
     * @param  {[type]} $sessionStorage  [description]
     */
    .controller('personalCtrl', function($scope,$kit,$state,$stateParams,$sessionStorage) {
        $scope.paras = $stateParams;
        if($kit.isEmpty($stateParams.ids)){
            $kit.alert('网络不给力');
            return false;
        }
        $kit.autoPost('user/info',$stateParams,function(json){
            $scope.userInfo = json;
        });
        $scope.exitLogin = function(){
            $kit.autoPost('user/loginout',{sessionid:$kit.getSessionid()},function(json){
                $sessionStorage.user = null;
            });
        }

    })
    /**
     * 赞过的用户
     * @param  {[type]} $scope           [description]
     * @param  {[type]} $kit             [description]
     * @param  {[type]} $state           [description]
     * @param  {[type]} $stateParams     [description]
     * @param  {[type]} $sessionStorage  [description]
     */
    .controller('praisedCtrl', function($scope,$kit,$state,$stateParams,$sessionStorage) {
        $scope.menuToggle=false;
        $scope.toggleMenu = function(){$scope.menuToggle = !$scope.menuToggle}
        $scope.go = $kit.go;
        $scope.pageNumber = $stateParams.pageNumber || 1;
        $scope.praisedList = [];
        $scope.load = function(){
            $kit.autoPost('apppraise',
                {
                    contentids:$stateParams.contentids
                    ,pageNumber:$scope.pageNumber++
                },function(json){
                $scope.praisedList = $scope.praisedList.concat(json.praise);
                $scope.page = json.page;
            })
        }
        $scope.load();
    })
    /**
     * 消息页
     * @param  {[type]} $scope           [description]
     * @param  {[type]} $kit             [description]
     * @param  {[type]} $state           [description]
     * @param  {[type]} $sessionStorage  [description]
     */
    .controller('messageCtrl', function($scope,$kit,$state,$sessionStorage) {
        $scope.go = function(args){
            if($kit.isEmpty($sessionStorage.user)){
                $kit.go(['login']);
                return false;
            }
            $kit.go(args);
        }
    })
    /**
     * 收藏内容
     * @param  {[type]} $scope           [description]
     * @param  {[type]} $kit             [description]
     * @param  {[type]} $state           [description]
     * @param  {[type]} $sessionStorage  [description]
     */
    .controller('collectContentCtrl', function($scope,$kit,$state,$stateParams,$sessionStorage) {
        var params = $stateParams;
        $scope.pageNumber = params.pageNumber || 1;
        $scope.uids = params.uids;
        $scope.play_index = -1;
        $scope.pmap = {};
        $scope.contentList = [];
        $scope.load = function(pageNumber){
            $kit.autoPost('appcollection',{userids:$scope.uids,pageNumber:$scope.pageNumber++,sessionid:$kit.getSessionid()},function(json){
                $scope.contentList = $scope.contentList.concat(json.contents);
                $scope.page = json.page;
            });
        }
        $scope.play = function(_index){
            $scope.play_index = _index;
        }
        /**
         * 跳转页面 - 播放停止
         */
        $scope.go = function(args){
            $scope.play_index = -1;
            $kit.go(args);
        }
        $scope.praised = function(contentids){
            $kit.togglePraised(contentids,$scope.pmap[contentids],function(){});
        }
        $scope.load();
    })
    /**
     * 收藏频道
     * @param  {[type]} $scope           [description]
     * @param  {[type]} $kit             [description]
     * @param  {[type]} $state           [description]
     * @param  {[type]} $sessionStorage  [description]
     */
    .controller('collectChannelCtrl', function($scope,$kit,$state,$sessionStorage,$stateParams) {
        $scope.pageNumber = $stateParams.pageNumber || 1;
        $scope.uids = $stateParams.uids;
        $scope.channelList = [];
        $scope.load = function(pageNumber){
            $kit.autoPost('appchannel/getLikeChannel',{userids:$scope.uids,pageNumber:$scope.pageNumber++,sessionid:$kit.getSessionid()},function(json){
                $scope.channelList = $scope.channelList.concat(json.channels);
                $scope.page = json.page;
            });
        }
        $scope.load();
    })
    /**
     * 收藏频道
     * @param  {[type]} $scope           [description]
     * @param  {[type]} $kit             [description]
     * @param  {[type]} $state           [description]
     * @param  {[type]} $sessionStorage  [description]
     */
    .controller('commentReplyCtrl', function($scope,$kit,$state,$sessionStorage,$stateParams) {
        $scope.menuToggle=false;
        $scope.toggleMenu = function(){
            $scope.menuToggle = !$scope.menuToggle;
        }
        $scope.go = function(args){
            $kit.go(args);
        }
        $scope.pageNumber = $stateParams.pageNumber || 1;
        $scope.replyList = [];
        $scope.load = function(pageNumber){
            $kit.autoPost('comment/list',{pageNumber:$scope.pageNumber++,sessionid:$kit.getSessionid()},function(json){
                $scope.replyList = $scope.replyList.concat(json.comment);
                $scope.page = json.page;
            });
        }
        $scope.load();
    })
    ;
}(window);