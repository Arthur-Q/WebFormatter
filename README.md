##WebFormatter功能
WebFormatter 用于格式换Web开发相关的语言格式.
目前支持的语言包括:
* Javascript
* HTML
* CSS

目前支持的IDE:
* Notepad++ (unicode版)

WebFormatter集成了Zend Coding插件, 比如输入: 

    html>head+body  
    
然后按下 "ctrl+2", 则可以展开成:

    <html>
        <head></head>
        <body></body>
    </html> 

WebFormattter集成了 MenuCmds 和SmartHighlighter插件, 因为  SmartHighlighter 插件 使用了 MenuCmds 插件. 
SmartHighlighter的主要作用,是当搜索一个关键字的时候, 会在窗口滚动条右侧, 用颜色标识出关键字出现的位置. 

    
##安装方法
###[NotePad++]
复制 [Notepad++ Directory] 目录中的plugins文件夹, 到Notepad的安装目录即可.

##使用方法
启动notepad++后, 菜单栏会增加 WebFormatter 菜单项. 里面包括:
* Smart Format Current File Ctrl+1: 智能格式化代码(整个文件), 会根据文件内容自动选择格式化类型.
* Smart Format Selected Text : 智能格式化代码(选中文字), 会根据文件内容自动选择格式化类型.
* Only Format Js File : 使用JS格式化器格式化文件
* Only Format Css File : 使用CSS格式化器格式化文件
* Only Format Html File : 使用HTML格式化器格式化文件
* Zend Coding Expand Ctrl+2: 扩展 Zend Coding 标签

##其他说明
在 [Notepad++ Directory] 目录中, 有一个 userDefineLang.xml 文件. 用来支持markdown文件(.md结尾)的语法找色.
使用方法是打开notepad++, 选择 "语言"->"define your language"->"导入", 选中此xml文件, 重启notepad, 会发现打开".md"结尾的文件时, 已经能够识别成markdown文件了.


本插件格式化后的换行符为Unix格式, 即"LF", Window格式为"CR LF", Mac格式为"CR".
可以在"编辑->档案格式转换"菜单中, 更改换行符的格式. 
因为js在上线前基本都是压缩成一行的,即不会有换行问题.
而且线上服务器大部分都是linux, 所以这里使用"LF"换行.

