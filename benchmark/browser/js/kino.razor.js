(function () {
    var Html = {
        escape: function (value) {
            return ('' + value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
        }
    };

    var _unescape = function (code) {
        return code.replace(/\\\\/g, '\\').replace(/\\'/g, "'");
    };

    var _symbol = '@';

    var gf = function (templateStr, setting) {
        ///<summary>
        ///获取模板函数
        ///</summary>
        ///<param name="templateStr" type="String">模板字符串</param>
        ///<param name="setting" type="Json">
        ///[option]可选设置
        ///&#10;1.enableCleanMode type="Boolean" 设置是否清空未匹配变量
        ///&#10;2.enableEscape type="Boolean" 设置是否使用字符转换
        ///</param>
        ///<returns type="Function" />
        var logic = new RegExp(_symbol + "((?:if|for|while)\\s*\\([^\\)]+\\)\\s*{)", "g");
        var block = new RegExp(_symbol + "{([^}]*)}", "g");

        var variable = new RegExp(_symbol + "((?:new\\s+[a-z0-9]+\\([^\\)]*\\)|[a-z0-9]+)(?:\\.|\\([^\\)]*\\)|[a-z0-9\\[\\]]+)*)", "ig");
        var elseblock = new RegExp("([}\\s])(else\\s*(?:if\\s*\\([^\\)]+\\))?{)", "g");

        var doubleSymbol = new RegExp(_symbol + _symbol, "g");
        var handleBrace = new RegExp(_symbol + "}", "g");

        var s = "var __p='';with(obj||{}){__p=__p+'" + templateStr.replace(/\r/g, '\\r')
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/\n/g, '')
            .replace(/\\\\r/g, '')
            .replace(/\t/g, '')
            .replace(doubleSymbol, '%$a$%')
            .replace(handleBrace, '%$b$%')
            .replace(block, function (match, $1) {
                return "';" + _unescape($1) + "__p=__p+'";
            })
            .replace(logic, function (match, $1) {
                return "';" + _unescape($1) + "__p=__p+'";
            })
            .replace(elseblock, function (match, $1, $2) {
                return "';" + $1 + _unescape($2) + "__p=__p+'";
            })
            .replace(variable, function (match, $1) {
                var str = "';";
                //if (typeof setting !== 'undefined' && setting.enableCleanMode === true)
                str = str + "if(typeof " + $1 + " === 'undefined')" + $1 + "='';";
                str = str + "__p=__p+" + $1 + ";__p=__p+'";
                return str;
            })
            .replace(/}(?!\s*else)/g, "';}__p=__p+'")
            .replace(/%\$b\$%/g, '}')
            .replace(/%\$a\$%/g, _symbol)
             + "';};return __p;";

        return new Function('Html', 'obj', s);
    };



    var t = function () {
        ///<summary>
        ///kino模板工具
        ///</summary>
        ///<param name="templateStr" type="String">模板字符串</param>
        ///<param name="data" type="Json">变量容器</param>
        ///<param name="setting" type="Json">
        ///[option]可选设置
        ///&#10;1.enableCleanMode type="Boolean" 设置是否清空未匹配变量
        ///&#10;2.enableEscape type="Boolean" 设置是否使用字符转换
        ///</param>
        ///<returns type="String" />
        if (arguments.length == 1)
            return gf(arguments[0]);
        else {
            var func;
            var temp = arguments[0];
            if (typeof temp === 'function')
                func = temp;
            else
                func = gf(temp);
            return func.call(null, Html, arguments[1]);
        }
    };

    t.use = function (symbol) {
        _symbol = symbol.replace(/([\^\$\[\]\(\)])/g, "\\$1");
    };


    // Module
    if (typeof module != 'undefined' && module.exports) {
        module.exports = t;
    }
    else {
        this.kino = this.kino ? this.kino : {};
        this.kino.razor = t;
    }
})();