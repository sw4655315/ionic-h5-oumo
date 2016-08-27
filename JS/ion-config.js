!function(win,undefined) {
    angular.module('axibar.config', [])
    .factory('$kit',function($rootScope,$ionicPopup,$http,$state,$sessionStorage,$ionicLoading,$ionicModal){
        var $kit = {};
        angular.copy(axibar,$kit);
        // $kit.port = axibar.port;
        // $kit.download = axibar.download;
        // $kit.success = axibar.success;
        // $kit.ServiceErr = axibar.ServiceErr;

        $kit.getSessionid = function(){
            var user = $sessionStorage.user;
            if($kit.isEmpty(user)){
                return null;
            }
            return user.sessionid;
        }  
        $kit.getSessionid = function(){
            var user = $sessionStorage.user;
            if($kit.isEmpty(user)){
                return null;
            }
            return user.sessionid;
        }  

        $kit.togglePraised = function(contentids,praiseObj,callback){
            if($kit.isEmpty($sessionStorage.user)){
                $kit.go(['login']);
                return false;
            }
            var isPraised = praiseObj.isPraised;
            $kit.autoPost('apppraise/update',{'collectedids':contentids,'op':isPraised?2:1,'sessionid':$kit.getSessionid()},function(json){
                if(isPraised){
                    $kit.alert('取消点赞');
                    praiseObj.praiseInfo.praiseTotal--;
                    $kit.removePraise(praiseObj.praiseInfo.praise);
                }else{
                    $kit.alert('点赞+1');
                    praiseObj.praiseInfo.praiseTotal++;
                    $kit.addPraise(praiseObj.praiseInfo.praise);
                    // $scope.pmap[contentids].praiseInfo.praise.splice(0,0,$sessionStorage.user);
                }
                praiseObj.isPraised = !praiseObj.isPraised;
            })
        }

        $kit.removePraise = function(praiseList,callback){
            var user = $sessionStorage.user;
            for (var i = praiseList.length - 1; i >= 0; i--) {
                if(praiseList[i].ids == user.ids){
                    praiseList.splice(i,1);
                }
            };
        }

        $kit.addPraise = function(praiseList){
            var user = $sessionStorage.user;
            for (var i = praiseList.length - 1; i >= 0; i--) {
                if(praiseList[i].ids == user.ids){
                    return false;
                }
            };
            praiseList.splice(0,0,user);
        }

        $kit.isEmpty = function(o){
            return o === void 0 
                || o === null 
                || o === "" 
                || o === "null" 
                || typeof o === void 0 
                || o === "-";
        }
        $kit.isMobile = function(str){
            return /^1[3578][0-9]{9}$/.test(str);
        }
        $kit.isPwd = function(str){
            return /^\w{6,16}$/.test(str);
        }
        $kit.isAuthCode = function(str){
            return /^\d{6}$/.test(str);
        }
        $kit.isUids = function(str){
            return /^YH\d{12,}$/.test(str);
        }
        // $kit.go = {
        //     index:function(){
        //         $state.go('app.index',{classifyids:'FL0001',pageNumber:1,sessionid:$sessionStorage.sessionid});
        //     }
        //     ,login:function(){
        //         $state.go('app.login',{});
        //     }
        //     ,back:function(){
        //         $rootScope.$ionicGoBack();
        //     }
        // };
        $kit.go = function(args){
            switch (args[0]) {
                case 'index':
                    $state.go('app.index',{classifyids:'FL0001',pageNumber:1,sessionid:$sessionStorage.sessionid});
                    break;
                case 'personal':
                    if($kit.isEmpty($sessionStorage.user)){
                        $state.go('app.login',{});
                    }else{
                        if($kit.isEmpty(args[1]) || args[1] == $sessionStorage.user.ids){
                            $state.go('app.personal',{self:1,ids:$sessionStorage.user.ids});
                        }else{
                            $state.go('app.personal',{self:0,ids:args[1]});
                        }
                    }
                    break;
                case 'share':
                    window.location.href = $kit.download;
                    // $state.go('app.share',{});
                    break;
                case 'login':
                    $state.go('app.login',{});
                    break;
                case 'detail':
                    $state.go('app.detail',{contentids:args[1]});
                    break;
                case 'channel':
                    $state.go('app.channel',{pageNumber:1,ids:args[1],title:args[2]});
                    break;
                case 'channelInfo':
                    $state.go('app.channelInfo',{ids:args[1],title:args[2]});
                    break;
                case 'message':
                    $state.go('app.message',{});
                    break;
                case 'search':
                    window.location.href = $kit.download;
                    // $state.go('app.search',{});
                    break;
                case 'praised':
                    $state.go('app.praised',{contentids:args[1]});
                    break;
                case 'praisedReply':
                    $state.go('app.praisedReply',{});
                    break;
                case 'commentReply':
                    $state.go('app.commentReply',{});
                    break;
                case 'link':
                    window.location.href=args[1];
                    break;
                default: //goback
                    $rootScope.$ionicGoBack();
                    break;
            }
        }

        $kit.load = function(){
            $ionicLoading.show();
        }
        $kit.loadover = function(){
            $ionicLoading.hide();
        }

        $kit.alert = function(msg,title,callback){
             $ionicPopup.alert({
               title: title ||'提示',
               template: msg || '操作失败'
             }).then(function(res) {
               if(callback) callback();  
             });
        }
        $kit.post = function(url,paras,suc,err,finalFun){
            $kit.load();
            $http({
                method:'post'
                ,url:$kit.port  + url
                ,params:{}
                ,data: paras || {}
            }).success(suc).error(err).finally(function(){
                $kit.loadover();
                finalFun && finalFun();
            });
        }
        $kit.autoPost = function(url,data,suc,fina){
            $kit.post(url,data,function(json){
                if($kit.isEmpty(json) || json.rspCode === $kit.ServiceErr){
                    $kit.alert('网络不给力');
                    return false;
                }
                if(json.rspCode != $kit.success){
                    $kit.alert(json.rspMsg);
                    return false;
                }
                suc(json.rspObject);
            },function(e){
                $kit.alert('网络不给力');
            },fina);
        }
        return $kit;
    })
    .config(function($httpProvider){
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [function(data) {
        /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function(obj) {
            var query = '';
            var name, value, fullSubName, subName, subValue, innerObj, i;

            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value !== undefined && value !== null) {
                    query += encodeURIComponent(name) + '='
                            + encodeURIComponent(value) + '&';
                }
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        return angular.isObject(data) && String(data) !== '[object File]'
                ? param(data)
                : data;
    }];
    })
    .constant('$ionicLoadingConfig', {
      template: '<ion-spinner icon="circles" class="spinner-energized"></ion-spinner>'
    })
    /**
     * 路由配置
     */
    .config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider){
        /** 全局禁用view缓存 */
        // $ionicConfigProvider.views.maxCache(0);
        /**
         * 路由配置
         */
        $stateProvider
        .state('app', {
            url: ''
            ,abstract: true
            ,templateUrl: 'app.html'
            ,controller: 'appCtrl'
        })
        .state('app.index', {
            url: '/index'
            ,templateUrl: 'index.html'
            ,controller: 'indexCtrl'
        })
        .state('app.detail', {
            url: '/detail/:contentids'
            ,templateUrl: 'detail.html'
            ,controller: 'detailCtrl'
        })
        .state('app.login', {
            url: '/login'
            ,templateUrl: 'login.html'
            ,controller: 'loginCtrl'
        })
        .state('app.register', {
            url: '/register'
            ,templateUrl: 'register.html'
            ,controller: 'registerCtrl'
        })
        .state('app.reset', {
            url: '/reset'
            ,templateUrl: 'reset.html'
            ,controller: 'registerCtrl'
        })
        .state('app.channel', {
            url: '/channel/:pageNumber/:ids/:title'
            ,templateUrl: 'channel.html'
            ,controller: 'channelCtrl'
        })
        .state('app.channelInfo', {
            url: '/channel/info/:ids/:title'
            ,templateUrl: 'channelInfo.html'
            ,controller: 'channelInfoCtrl'
        })
        .state('app.message', {
            url: '/message'
            ,templateUrl: 'message.html'
            ,controller: 'messageCtrl'
        })
        .state('app.personal', {
            url: '/personal/:self/:ids'
            ,templateUrl: 'personal.html'
            ,controller: 'personalCtrl'
        })
        .state('app.praised', {
            url: '/praised/:contentids/:pageNumber'
            ,templateUrl: 'praised.html'
            ,controller: 'praisedCtrl'
        })
        .state('app.collectContent', {
            url: '/collect/content/:uids/:pageNumber'
            ,templateUrl: 'collectContent.html'
            ,controller: 'collectContentCtrl'
        })
        .state('app.collectChannel', {
            url: '/collect/channel/:uids/:pageNumber'
            ,templateUrl: 'collectChannel.html'
            ,controller: 'collectChannelCtrl'
        })
        .state('app.praisedReply', {
            url: '/praised/reply/:pageNumber'
            ,templateUrl: 'praisedReply.html'
            ,controller: 'praisedReplyCtrl'
        })
        .state('app.commentReply', {
            url: '/comment/reply/:pageNumber'
            ,templateUrl: 'commentReply.html'
            ,controller: 'commentReplyCtrl'
        })
        ;
        $urlRouterProvider.otherwise('/index');
    })
    ;
}(window);
