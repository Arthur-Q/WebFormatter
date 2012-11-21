var itemMenu = Editor.addMenu("WebFormatter");
var webFormatterConfig = {
    "brace_style": "end-expand",
    "indent_char": " ",
    "indent_scripts": "normal",
    "indent_size": "4",
    "jslint_happy": true,
    "keep_array_indentation": false,
    "preserve_newlines": true,
    "max_preserve_newlines": 2,
    "space_after_anon_function": true,
    "space_before_conditional": true,
    "unescape_strings": false
};


var webFormatterCurrentFileCfg = {
    text: "Smart Format Current File \t Ctrl+1",
	ctrl: true,
    shift: false,
    alt: false,
    key: "1",
    cmd: function () {
        var source = Editor.currentView.text;
        var output = source;
		if (looks_like_js(source)) {
            output = js_beautify(source, webFormatterConfig);
        }
        else if (looks_like_html(source)) {
            output = style_html(source, webFormatterConfig);
        }
        else if (looks_like_css(source)) {
            output = css_beautify(source, webFormatterConfig);
        }
        else {
            output = js_beautify(source, webFormatterConfig);
        }
        Editor.currentView.text = output;
    }
};


var webFormatterSelectionCfg = {
    text: "Smart Format Selected Text \t ",
	ctrl: true,
    shift: false,
    alt: false,
    key: "1",
    cmd: function () {
        var source = Editor.currentView.selection;
        var output = source;
        if (looks_like_html(source)) {
            output = style_html(source, webFormatterConfig);
        }
        else if (looks_like_css(source)) {
            output = css_beautify(source, webFormatterConfig);
        }
        else {
            output = js_beautify(source, webFormatterConfig);
        }
        Editor.currentView.text = output;
    }
};

var jsFormatterFileCfg = {
    text: "Only Format Js File \t ",
    shift: true,
    alt: false,
    key: "j",
    cmd: function () {
        var source = Editor.currentView.text;
        var output = source;
        output = js_beautify(source, webFormatterConfig);
        Editor.currentView.text = output;
    }
};
var cssFormatterFileCfg = {
    text: "Only Format Css File \t ",
    shift: true,
    alt: false,
    key: "c",
    cmd: function () {
        var source = Editor.currentView.text;
        var output = source;
        output = css_beautify(source, webFormatterConfig);
        Editor.currentView.text = output;
    }
};
var htmlFormatterFileCfg = {
    text: "Only Format Html File \t ",
    shift: true,
    alt: false,
    key: "h",
    cmd: function () {
        var source = Editor.currentView.text;
        var output = source;
        output = style_html(source, webFormatterConfig);
        Editor.currentView.text = output;
    }
};

var zendCodingFileCfg = {
    text: "Zend Coding Expand \t Ctrl+2",
    shift: false,
    alt: false,
	ctrl: true,
    key: "2",
    cmd: function () {
        zc_manager("expand_abbreviation");
    }
};



System.addSystemHotKey(webFormatterCurrentFileCfg);
//System.addSystemHotKey(webFormatterSelectionCfg);
//System.addSystemHotKey(jsFormatterFileCfg);
//System.addSystemHotKey(cssFormatterFileCfg);
//System.addSystemHotKey(htmlFormatterFileCfg);
System.addSystemHotKey(zendCodingFileCfg);
itemMenu.addItem(webFormatterCurrentFileCfg);
itemMenu.addItem(webFormatterSelectionCfg);
itemMenu.addItem(jsFormatterFileCfg);
itemMenu.addItem(cssFormatterFileCfg);
itemMenu.addItem(htmlFormatterFileCfg);
itemMenu.addItem(zendCodingFileCfg);

var looks_like_js = function (source){
	    var result = false;
        var trimmed = source.replace(/^[\t\n\r]+/, '');
		var startString = trimmed.substring(0, 10)
		if( startString.indexOf("(")===0 || startString.indexOf("function")>-1 || startString.indexOf("var ")>-1 ){
			result = true;
		}
		return result;
	};

var looks_like_html = function looks_like_html(source) {
        // <foo> - looks like html // <!--\nalert('foo!');\n-- > -doesn 't look like html
        var result = false;
        var trimmed = source.replace(/^[\t\n\r]+/, '');
        var comment_mark = ' < ' + '!-' + ' - ';
        var isXml = trimmed.substring(0, 2)==="<?";
        var isHtml = trimmed.substring(0, 1)==="<";
        var isComment = trimmed.substring(0, 4) === comment_mark;
        if( isComment ){
            result = false;
        }
        else if(isXml || isHtml){
            result = true;
        }
        else{
            result = false;
        }
        return result;
    };
var looks_like_css = function looks_like_html(source) {
        // <foo> - looks like html // <!--\nalert('foo!');\n--> - doesn't look like html
        var trimmed = source.replace(/^[\t\n\r]+/, '');
        var regex = new RegExp("^([^\{=;\{\}\@]+{)", "i");
        return (regex.test(trimmed));
    };
/* ==================== beautify.js ==================== */
/*jslint onevar: false, plusplus: false */
/*

 JS Beautifier
---------------


  Written by Einar Lielmanis, <einar@jsbeautifier.org>
      http://jsbeautifier.org/

  Originally converted to javascript by Vital, <vital76@gmail.com>
  "End braces on own line" added by Chris J. Shull, <chrisjshull@gmail.com>

  You are free to use this in any way you want, in case you find this useful or working for you.

  Usage:
    js_beautify(js_source_text);
    js_beautify(js_source_text, options);

  The options are:
    indent_size (default 4)          — indentation size,
    indent_char (default space)      — character to indent with,
    preserve_newlines (default true) — whether existing line breaks should be preserved,
    preserve_max_newlines (default unlimited) - maximum number of line breaks to be preserved in one chunk,

    jslint_happy (default false) — if true, then jslint-stricter mode is enforced.

            jslint_happy   !jslint_happy
            ---------------------------------
             function ()      function()

    brace_style (default "collapse") - "collapse" | "expand" | "end-expand" | "expand-strict"
            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line.

            expand-strict: put brace on own line even in such cases:

                var a =
                {
                    a: 5,
                    b: 6
                }
            This mode may break your scripts - e.g "return { a: 1 }" will be broken into two lines, so beware.

    space_before_conditional (default true) - should the space before conditional statement be added, "if(true)" vs "if (true)",

    unescape_strings (default false) - should printable characters in strings encoded in \xNN notation be unescaped, "example" vs "\x65\x78\x61\x6d\x70\x6c\x65"

    e.g

    js_beautify(js_source_text, {
      'indent_size': 1,
      'indent_char': '\t'
    });


*/
function js_beautify(js_source_text, options) {
    var input, output, token_text, last_type, last_text, last_last_text, last_word, flags, flag_store, indent_string;
    var whitespace, wordchar, punct, parser_pos, line_starters, digits;
    var prefix, token_type, do_block_just_closed;
    var wanted_newline, just_added_newline, n_newlines;
    var preindent_string = '';
    // Some interpreters have unexpected results with foo = baz || bar;
    options = options ? options : {};
    var opt_brace_style;
    // compatibility
    if (options.space_after_anon_function !== undefined && options.jslint_happy === undefined) {
        options.jslint_happy = options.space_after_anon_function;
    }
    if (options.braces_on_own_line !== undefined) { //graceful handling of deprecated option
        opt_brace_style = options.braces_on_own_line ? "expand" : "collapse";
    }
    opt_brace_style = options.brace_style ? options.brace_style : (opt_brace_style ? opt_brace_style : "collapse");
    var opt_indent_size = options.indent_size ? options.indent_size : 4;
    var opt_indent_char = options.indent_char ? options.indent_char : ' ';
    var opt_preserve_newlines = typeof options.preserve_newlines === 'undefined' ? true : options.preserve_newlines;
    var opt_max_preserve_newlines = typeof options.max_preserve_newlines === 'undefined' ? false : options.max_preserve_newlines;
    var opt_jslint_happy = options.jslint_happy === 'undefined' ? false : options.jslint_happy;
    var opt_keep_array_indentation = typeof options.keep_array_indentation === 'undefined' ? false : options.keep_array_indentation;
    var opt_space_before_conditional = typeof options.space_before_conditional === 'undefined' ? true : options.space_before_conditional;
    var opt_indent_case = typeof options.indent_case === 'undefined' ? false : options.indent_case;
    var opt_unescape_strings = typeof options.unescape_strings === 'undefined' ? false : options.unescape_strings;
    just_added_newline = false;
    // cache the source's length.
    var input_length = js_source_text.length;

    function trim_output(eat_newlines) {
        eat_newlines = typeof eat_newlines === 'undefined' ? false : eat_newlines;
        while (output.length && (output[output.length - 1] === ' ' || output[output.length - 1] === indent_string || output[output.length - 1] === preindent_string || (eat_newlines && (output[output.length - 1] === '\n' || output[output.length - 1] === '\r')))) {
            output.pop();
        }
    }

    function trim(s) {
        return s.replace(/^\s\s*|\s\s*$/, '');
    }
    // we could use just string.split, but
    // IE doesn't like returning empty strings
    function split_newlines(s) {
        //return s.split(/\x0d\x0a|\x0a/);
        s = s.replace(/\x0d/g, '');
        var out = [],
            idx = s.indexOf("\n");
        while (idx != -1) {
            out.push(s.substring(0, idx));
            s = s.substring(idx + 1);
            idx = s.indexOf("\n");
        }
        if (s.length) {
            out.push(s);
        }
        return out;
    }

    function force_newline() {
        var old_keep_array_indentation = opt_keep_array_indentation;
        opt_keep_array_indentation = false;
        print_newline()
        opt_keep_array_indentation = old_keep_array_indentation;
    }

    function print_newline(ignore_repeated) {
        flags.eat_next_space = false;
        if (opt_keep_array_indentation && is_array(flags.mode)) {
            return;
        }
        ignore_repeated = typeof ignore_repeated === 'undefined' ? true : ignore_repeated;
        flags.if_line = false;
        trim_output();
        if (!output.length) {
            return; // no newline on start of file
        }
        if (output[output.length - 1] !== "\n" || !ignore_repeated) {
            just_added_newline = true;
            output.push("\n");
        }
        if (preindent_string) {
            output.push(preindent_string);
        }
        for (var i = 0; i < flags.indentation_level; i += 1) {
            output.push(indent_string);
        }
        if (flags.var_line && flags.var_line_reindented) {
            output.push(indent_string); // skip space-stuffing, if indenting with a tab
        }
        if (flags.case_body) {
            output.push(indent_string);
        }
    }

    function print_single_space() {
        if (last_type === 'TK_COMMENT') {
            return print_newline();
        }
        if (flags.eat_next_space) {
            flags.eat_next_space = false;
            return;
        }
        var last_output = ' ';
        if (output.length) {
            last_output = output[output.length - 1];
        }
        if (last_output !== ' ' && last_output !== '\n' && last_output !== indent_string) { // prevent occassional duplicate space
            output.push(' ');
        }
    }

    function print_token() {
        just_added_newline = false;
        flags.eat_next_space = false;
        output.push(token_text);
    }

    function indent() {
        flags.indentation_level += 1;
    }

    function remove_indent() {
        if (output.length && output[output.length - 1] === indent_string) {
            output.pop();
        }
    }

    function set_mode(mode) {
        if (flags) {
            flag_store.push(flags);
        }
        flags = {
            previous_mode: flags ? flags.mode : 'BLOCK',
            mode: mode,
            var_line: false,
            var_line_tainted: false,
            var_line_reindented: false,
            in_html_comment: false,
            if_line: false,
            in_case_statement: false, // switch(..){ INSIDE HERE }
            in_case: false, // we're on the exact line with "case 0:"
            case_body: false, // the indented case-action block
            eat_next_space: false,
            indentation_baseline: -1,
            indentation_level: (flags ? flags.indentation_level + (flags.case_body ? 1 : 0) + ((flags.var_line && flags.var_line_reindented) ? 1 : 0) : 0),
            ternary_depth: 0
        };
    }

    function is_array(mode) {
        return mode === '[EXPRESSION]' || mode === '[INDENTED-EXPRESSION]';
    }

    function is_expression(mode) {
        return in_array(mode, ['[EXPRESSION]', '(EXPRESSION)', '(FOR-EXPRESSION)', '(COND-EXPRESSION)']);
    }

    function restore_mode() {
        do_block_just_closed = flags.mode === 'DO_BLOCK';
        if (flag_store.length > 0) {
            var mode = flags.mode;
            flags = flag_store.pop();
            flags.previous_mode = mode;
        }
    }

    function all_lines_start_with(lines, c) {
        for (var i = 0; i < lines.length; i++) {
            var line = trim(lines[i]);
            if (line.charAt(0) !== c) {
                return false;
            }
        }
        return true;
    }

    function is_special_word(word) {
        return in_array(word, ['case', 'return', 'do', 'if', 'throw', 'else']);
    }

    function in_array(what, arr) {
        for (var i = 0; i < arr.length; i += 1) {
            if (arr[i] === what) {
                return true;
            }
        }
        return false;
    }

    function look_up(exclude) {
        var local_pos = parser_pos;
        var c = input.charAt(local_pos);
        while (in_array(c, whitespace) && c != exclude) {
            local_pos++;
            if (local_pos >= input_length) return 0;
            c = input.charAt(local_pos);
        }
        return c;
    }

    function get_next_token() {
        n_newlines = 0;
        if (parser_pos >= input_length) {
            return ['', 'TK_EOF'];
        }
        wanted_newline = false;
        var c = input.charAt(parser_pos);
        parser_pos += 1;
        var keep_whitespace = opt_keep_array_indentation && is_array(flags.mode);
        if (keep_whitespace) {
            //
            // slight mess to allow nice preservation of array indentation and reindent that correctly
            // first time when we get to the arrays:
            // var a = [
            // ....'something'
            // we make note of whitespace_count = 4 into flags.indentation_baseline
            // so we know that 4 whitespaces in original source match indent_level of reindented source
            //
            // and afterwards, when we get to
            //    'something,
            // .......'something else'
            // we know that this should be indented to indent_level + (7 - indentation_baseline) spaces
            //
            var whitespace_count = 0;
            while (in_array(c, whitespace)) {
                if (c === "\n") {
                    trim_output();
                    output.push("\n");
                    just_added_newline = true;
                    whitespace_count = 0;
                }
                else {
                    if (c === '\t') {
                        whitespace_count += 4;
                    }
                    else if (c === '\r') {
                        // nothing
                    }
                    else {
                        whitespace_count += 1;
                    }
                }
                if (parser_pos >= input_length) {
                    return ['', 'TK_EOF'];
                }
                c = input.charAt(parser_pos);
                parser_pos += 1;
            }
            if (flags.indentation_baseline === -1) {
                flags.indentation_baseline = whitespace_count;
            }
            if (just_added_newline) {
                var i;
                for (i = 0; i < flags.indentation_level + 1; i += 1) {
                    output.push(indent_string);
                }
                if (flags.indentation_baseline !== -1) {
                    for (i = 0; i < whitespace_count - flags.indentation_baseline; i++) {
                        output.push(' ');
                    }
                }
            }
        }
        else {
            while (in_array(c, whitespace)) {
                if (c === "\n") {
                    n_newlines += ((opt_max_preserve_newlines) ? (n_newlines <= opt_max_preserve_newlines) ? 1 : 0 : 1);
                }
                if (parser_pos >= input_length) {
                    return ['', 'TK_EOF'];
                }
                c = input.charAt(parser_pos);
                parser_pos += 1;
            }
            if (opt_preserve_newlines) {
                if (n_newlines > 1) {
                    for (i = 0; i < n_newlines; i += 1) {
                        print_newline(i === 0);
                        just_added_newline = true;
                    }
                }
            }
            wanted_newline = n_newlines > 0;
        }
        if (in_array(c, wordchar)) {
            if (parser_pos < input_length) {
                while (in_array(input.charAt(parser_pos), wordchar)) {
                    c += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos === input_length) {
                        break;
                    }
                }
            }
            // small and surprisingly unugly hack for 1E-10 representation
            if (parser_pos !== input_length && c.match(/^[0-9]+[Ee]$/) && (input.charAt(parser_pos) === '-' || input.charAt(parser_pos) === '+')) {
                var sign = input.charAt(parser_pos);
                parser_pos += 1;
                var t = get_next_token(parser_pos);
                c += sign + t[0];
                return [c, 'TK_WORD'];
            }
            if (c === 'in') { // hack for 'in' operator
                return [c, 'TK_OPERATOR'];
            }
            if (wanted_newline && last_type !== 'TK_OPERATOR' && last_type !== 'TK_EQUALS' && !flags.if_line && (opt_preserve_newlines || last_text !== 'var')) {
                print_newline();
            }
            return [c, 'TK_WORD'];
        }
        if (c === '(' || c === '[') {
            return [c, 'TK_START_EXPR'];
        }
        if (c === ')' || c === ']') {
            return [c, 'TK_END_EXPR'];
        }
        if (c === '{') {
            return [c, 'TK_START_BLOCK'];
        }
        if (c === '}') {
            return [c, 'TK_END_BLOCK'];
        }
        if (c === ';') {
            return [c, 'TK_SEMICOLON'];
        }
        if (c === '/') {
            var comment = '';
            // peek for comment /* ... */
            var inline_comment = true;
            if (input.charAt(parser_pos) === '*') {
                parser_pos += 1;
                if (parser_pos < input_length) {
                    while (parser_pos < input_length && !(input.charAt(parser_pos) === '*' && input.charAt(parser_pos + 1) && input.charAt(parser_pos + 1) === '/')) {
                        c = input.charAt(parser_pos);
                        comment += c;
                        if (c === "\n" || c === "\r") {
                            inline_comment = false;
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            break;
                        }
                    }
                }
                parser_pos += 2;
                if (inline_comment && n_newlines == 0) {
                    return ['/*' + comment + '*/', 'TK_INLINE_COMMENT'];
                }
                else {
                    return ['/*' + comment + '*/', 'TK_BLOCK_COMMENT'];
                }
            }
            // peek for comment // ...
            if (input.charAt(parser_pos) === '/') {
                comment = c;
                while (input.charAt(parser_pos) !== '\r' && input.charAt(parser_pos) !== '\n') {
                    comment += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos >= input_length) {
                        break;
                    }
                }
                if (wanted_newline) {
                    print_newline();
                }
                return [comment, 'TK_COMMENT'];
            }
        }
        if (c === "'" || // string
        c === '"' || // string
        (c === '/' && ((last_type === 'TK_WORD' && is_special_word(last_text)) || (last_text === ')' && in_array(flags.previous_mode, ['(COND-EXPRESSION)', '(FOR-EXPRESSION)'])) || (last_type === 'TK_COMMENT' || last_type === 'TK_START_EXPR' || last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_OPERATOR' || last_type === 'TK_EQUALS' || last_type === 'TK_EOF' || last_type === 'TK_SEMICOLON')))) { // regexp
            var sep = c;
            var esc = false;
            var esc1 = 0;
            var esc2 = 0;
            var resulting_string = c;
            if (parser_pos < input_length) {
                if (sep === '/') {
                    //
                    // handle regexp separately...
                    //
                    var in_char_class = false;
                    while (esc || in_char_class || input.charAt(parser_pos) !== sep) {
                        resulting_string += input.charAt(parser_pos);
                        if (!esc) {
                            esc = input.charAt(parser_pos) === '\\';
                            if (input.charAt(parser_pos) === '[') {
                                in_char_class = true;
                            }
                            else if (input.charAt(parser_pos) === ']') {
                                in_char_class = false;
                            }
                        }
                        else {
                            esc = false;
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            // incomplete string/rexp when end-of-file reached.
                            // bail out with what had been received so far.
                            return [resulting_string, 'TK_STRING'];
                        }
                    }
                }
                else {
                    //
                    // and handle string also separately
                    //
                    while (esc || input.charAt(parser_pos) !== sep) {
                        resulting_string += input.charAt(parser_pos);
                        if (esc1 && esc1 >= esc2) {
                            esc1 = parseInt(resulting_string.substr(-esc2), 16);
                            if (esc1 && esc1 >= 0x20 && esc1 <= 0x7e) {
                                esc1 = String.fromCharCode(esc1);
                                resulting_string = resulting_string.substr(0, resulting_string.length - esc2 - 2) + (((esc1 === sep) || (esc1 === '\\')) ? '\\' : '') + esc1;
                            }
                            esc1 = 0;
                        }
                        if (esc1) {
                            esc1++;
                        }
                        else if (!esc) {
                            esc = input.charAt(parser_pos) === '\\';
                        }
                        else {
                            esc = false;
                            if (opt_unescape_strings) {
                                if (input.charAt(parser_pos) === 'x') {
                                    esc1++;
                                    esc2 = 2;
                                }
                                else if (input.charAt(parser_pos) === 'u') {
                                    esc1++;
                                    esc2 = 4;
                                }
                            }
                        }
                        parser_pos += 1;
                        if (parser_pos >= input_length) {
                            // incomplete string/rexp when end-of-file reached.
                            // bail out with what had been received so far.
                            return [resulting_string, 'TK_STRING'];
                        }
                    }
                }
            }
            parser_pos += 1;
            resulting_string += sep;
            if (sep === '/') {
                // regexps may have modifiers /regexp/MOD , so fetch those, too
                while (parser_pos < input_length && in_array(input.charAt(parser_pos), wordchar)) {
                    resulting_string += input.charAt(parser_pos);
                    parser_pos += 1;
                }
            }
            return [resulting_string, 'TK_STRING'];
        }
        if (c === '#') {
            if (output.length === 0 && input.charAt(parser_pos) === '!') {
                // shebang
                resulting_string = c;
                while (parser_pos < input_length && c != '\n') {
                    c = input.charAt(parser_pos);
                    resulting_string += c;
                    parser_pos += 1;
                }
                output.push(trim(resulting_string) + '\n');
                print_newline();
                return get_next_token();
            }
            // Spidermonkey-specific sharp variables for circular references
            // https://developer.mozilla.org/En/Sharp_variables_in_JavaScript
            // http://mxr.mozilla.org/mozilla-central/source/js/src/jsscan.cpp around line 1935
            var sharp = '#';
            if (parser_pos < input_length && in_array(input.charAt(parser_pos), digits)) {
                do {
                    c = input.charAt(parser_pos);
                    sharp += c;
                    parser_pos += 1;
                } while (parser_pos < input_length && c !== '#' && c !== '=');
                if (c === '#') {
                    //
                }
                else if (input.charAt(parser_pos) === '[' && input.charAt(parser_pos + 1) === ']') {
                    sharp += '[]';
                    parser_pos += 2;
                }
                else if (input.charAt(parser_pos) === '{' && input.charAt(parser_pos + 1) === '}') {
                    sharp += '{}';
                    parser_pos += 2;
                }
                return [sharp, 'TK_WORD'];
            }
        }
        if (c === '<' && input.substring(parser_pos - 1, parser_pos + 3) === '<!--') {
            parser_pos += 3;
            c = '<!--';
            while (input.charAt(parser_pos) != '\n' && parser_pos < input_length) {
                c += input.charAt(parser_pos);
                parser_pos++;
            }
            flags.in_html_comment = true;
            return [c, 'TK_COMMENT'];
        }
        if (c === '-' && flags.in_html_comment && input.substring(parser_pos - 1, parser_pos + 2) === '-->') {
            flags.in_html_comment = false;
            parser_pos += 2;
            if (wanted_newline) {
                print_newline();
            }
            return ['-->', 'TK_COMMENT'];
        }
        if (in_array(c, punct)) {
            while (parser_pos < input_length && in_array(c + input.charAt(parser_pos), punct)) {
                c += input.charAt(parser_pos);
                parser_pos += 1;
                if (parser_pos >= input_length) {
                    break;
                }
            }
            if (c === ',') {
                return [c, 'TK_COMMA'];
            }
            else if (c === '=') {
                return [c, 'TK_EQUALS'];
            }
            else {
                return [c, 'TK_OPERATOR'];
            }
        }
        return [c, 'TK_UNKNOWN'];
    }
    //----------------------------------
    indent_string = '';
    while (opt_indent_size > 0) {
        indent_string += opt_indent_char;
        opt_indent_size -= 1;
    }
    while (js_source_text && (js_source_text.charAt(0) === ' ' || js_source_text.charAt(0) === '\t')) {
        preindent_string += js_source_text.charAt(0);
        js_source_text = js_source_text.substring(1);
    }
    input = js_source_text;
    last_word = ''; // last 'TK_WORD' passed
    last_type = 'TK_START_EXPR'; // last token type
    last_text = ''; // last token text
    last_last_text = ''; // pre-last token text
    output = [];
    do_block_just_closed = false;
    whitespace = "\n\r\t ".split('');
    wordchar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('');
    digits = '0123456789'.split('');
    punct = '+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |= ::';
    punct += ' <%= <% %> <?= <? ?>'; // try to be a good boy and try not to break the markup language identifiers
    punct = punct.split(' ');
    // words which should always start on new line.
    line_starters = 'continue,try,throw,return,var,if,switch,case,default,for,while,break,function'.split(',');
    // states showing if we are currently in expression (i.e. "if" case) - 'EXPRESSION', or in usual block (like, procedure), 'BLOCK'.
    // some formatting depends on that.
    flag_store = [];
    set_mode('BLOCK');
    parser_pos = 0;
    while (true) {
        var t = get_next_token(parser_pos);
        token_text = t[0];
        token_type = t[1];
        if (token_type === 'TK_EOF') {
            break;
        }
        switch (token_type) {
        case 'TK_START_EXPR':
            if (token_text === '[') {
                if (last_type === 'TK_WORD' || last_text === ')') {
                    // this is array index specifier, break immediately
                    // a[x], fn()[x]
                    if (in_array(last_text, line_starters)) {
                        print_single_space();
                    }
                    set_mode('(EXPRESSION)');
                    print_token();
                    break;
                }
                if (flags.mode === '[EXPRESSION]' || flags.mode === '[INDENTED-EXPRESSION]') {
                    if (last_last_text === ']' && last_text === ',') {
                        // ], [ goes to new line
                        if (flags.mode === '[EXPRESSION]') {
                            flags.mode = '[INDENTED-EXPRESSION]';
                            if (!opt_keep_array_indentation) {
                                indent();
                            }
                        }
                        set_mode('[EXPRESSION]');
                        if (!opt_keep_array_indentation) {
                            print_newline();
                        }
                    }
                    else if (last_text === '[') {
                        if (flags.mode === '[EXPRESSION]') {
                            flags.mode = '[INDENTED-EXPRESSION]';
                            if (!opt_keep_array_indentation) {
                                indent();
                            }
                        }
                        set_mode('[EXPRESSION]');
                        if (!opt_keep_array_indentation) {
                            print_newline();
                        }
                    }
                    else {
                        set_mode('[EXPRESSION]');
                    }
                }
                else {
                    set_mode('[EXPRESSION]');
                }
            }
            else {
                if (last_word === 'for') {
                    set_mode('(FOR-EXPRESSION)');
                }
                else if (in_array(last_word, ['if', 'while'])) {
                    set_mode('(COND-EXPRESSION)');
                }
                else {
                    set_mode('(EXPRESSION)');
                }
            }
            if (last_text === ';' || last_type === 'TK_START_BLOCK') {
                print_newline();
            }
            else if (last_type === 'TK_END_EXPR' || last_type === 'TK_START_EXPR' || last_type === 'TK_END_BLOCK' || last_text === '.') {
                if (wanted_newline) {
                    print_newline();
                }
                // do nothing on (( and )( and ][ and ]( and .(
            }
            else if (last_type !== 'TK_WORD' && last_type !== 'TK_OPERATOR') {
                print_single_space();
            }
            else if (last_word === 'function' || last_word === 'typeof') {
                // function() vs function ()
                if (opt_jslint_happy) {
                    print_single_space();
                }
            }
            else if (in_array(last_text, line_starters) || last_text === 'catch') {
                if (opt_space_before_conditional) {
                    print_single_space();
                }
            }
            print_token();
            break;
        case 'TK_END_EXPR':
            if (token_text === ']') {
                if (opt_keep_array_indentation) {
                    if (last_text === '}') {
                        // trim_output();
                        // print_newline(true);
                        remove_indent();
                        print_token();
                        restore_mode();
                        break;
                    }
                }
                else {
                    if (flags.mode === '[INDENTED-EXPRESSION]') {
                        if (last_text === ']') {
                            restore_mode();
                            print_newline();
                            print_token();
                            break;
                        }
                    }
                }
            }
            restore_mode();
            print_token();
            break;
        case 'TK_START_BLOCK':
            if (last_word === 'do') {
                set_mode('DO_BLOCK');
            }
            else {
                set_mode('BLOCK');
            }
            if (opt_brace_style == "expand" || opt_brace_style == "expand-strict") {
                var empty_braces = false;
                if (opt_brace_style == "expand-strict") {
                    empty_braces = (look_up() == '}');
                    if (!empty_braces) {
                        print_newline(true);
                    }
                }
                else {
                    if (last_type !== 'TK_OPERATOR') {
                        if (last_text === '=' || (is_special_word(last_text) && last_text !== 'else')) {
                            print_single_space();
                        }
                        else {
                            print_newline(true);
                        }
                    }
                }
                print_token();
                if (!empty_braces) indent();
            }
            else {
                if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
                    if (last_type === 'TK_START_BLOCK') {
                        print_newline();
                    }
                    else {
                        print_single_space();
                    }
                }
                else {
                    // if TK_OPERATOR or TK_START_EXPR
                    if (is_array(flags.previous_mode) && last_text === ',') {
                        if (last_last_text === '}') {
                            // }, { in array context
                            print_single_space();
                        }
                        else {
                            print_newline(); // [a, b, c, {
                        }
                    }
                }
                indent();
                print_token();
            }
            break;
        case 'TK_END_BLOCK':
            restore_mode();
            if (opt_brace_style == "expand" || opt_brace_style == "expand-strict") {
                if (last_text !== '{') {
                    print_newline();
                }
                print_token();
            }
            else {
                if (last_type === 'TK_START_BLOCK') {
                    // nothing
                    if (just_added_newline) {
                        remove_indent();
                    }
                    else {
                        // {}
                        trim_output();
                    }
                }
                else {
                    if (is_array(flags.mode) && opt_keep_array_indentation) {
                        // we REALLY need a newline here, but newliner would skip that
                        opt_keep_array_indentation = false;
                        print_newline();
                        opt_keep_array_indentation = true;
                    }
                    else {
                        print_newline();
                    }
                }
                print_token();
            }
            break;
        case 'TK_WORD':
            // no, it's not you. even I have problems understanding how this works
            // and what does what.
            if (do_block_just_closed) {
                // do {} ## while ()
                print_single_space();
                print_token();
                print_single_space();
                do_block_just_closed = false;
                break;
            }
            if (token_text === 'function') {
                if (flags.var_line) {
                    flags.var_line_reindented = true;
                }
                if ((just_added_newline || last_text === ';') && last_text !== '{' && last_type != 'TK_BLOCK_COMMENT' && last_type != 'TK_COMMENT') {
                    // make sure there is a nice clean space of at least one blank line
                    // before a new function definition
                    n_newlines = just_added_newline ? n_newlines : 0;
                    if (!opt_preserve_newlines) {
                        n_newlines = 1;
                    }
                    for (var i = 0; i < 2 - n_newlines; i++) {
                        print_newline(false);
                    }
                }
                if (last_type == 'TK_WORD' || last_text === 'get' || last_text === 'set' || last_text === 'new') {
                    print_single_space();
                }
                print_token();
                last_word = token_text;
                break;
            }
            if (token_text === 'case' || (token_text === 'default' && flags.in_case_statement)) {
                if (last_text === ':' || flags.case_body) {
                    // switch cases following one another
                    remove_indent();
                }
                else {
                    // case statement starts in the same line where switch
                    if (!opt_indent_case) flags.indentation_level--;
                    print_newline();
                    if (!opt_indent_case) flags.indentation_level++;
                }
                print_token();
                flags.in_case = true;
                flags.in_case_statement = true;
                flags.case_body = false;
                break;
            }
            prefix = 'NONE';
            if (last_type === 'TK_END_BLOCK') {
                if (!in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                    prefix = 'NEWLINE';
                }
                else {
                    if (opt_brace_style == "expand" || opt_brace_style == "end-expand" || opt_brace_style == "expand-strict") {
                        prefix = 'NEWLINE';
                    }
                    else {
                        prefix = 'SPACE';
                        print_single_space();
                    }
                }
            }
            else if (last_type === 'TK_SEMICOLON' && (flags.mode === 'BLOCK' || flags.mode === 'DO_BLOCK')) {
                prefix = 'NEWLINE';
            }
            else if (last_type === 'TK_SEMICOLON' && is_expression(flags.mode)) {
                prefix = 'SPACE';
            }
            else if (last_type === 'TK_STRING') {
                prefix = 'NEWLINE';
            }
            else if (last_type === 'TK_WORD') {
                if (last_text === 'else') {
                    // eat newlines between ...else *** some_op...
                    // won't preserve extra newlines in this place (if any), but don't care that much
                    trim_output(true);
                }
                prefix = 'SPACE';
            }
            else if (last_type === 'TK_START_BLOCK') {
                prefix = 'NEWLINE';
            }
            else if (last_type === 'TK_END_EXPR') {
                print_single_space();
                prefix = 'NEWLINE';
            }
            if (in_array(token_text, line_starters) && last_text !== ')') {
                if (last_text == 'else') {
                    prefix = 'SPACE';
                }
                else {
                    prefix = 'NEWLINE';
                }
            }
            if (flags.if_line && last_type === 'TK_END_EXPR') {
                flags.if_line = false;
            }
            if (in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                if (last_type !== 'TK_END_BLOCK' || opt_brace_style == "expand" || opt_brace_style == "end-expand" || opt_brace_style == "expand-strict") {
                    print_newline();
                }
                else {
                    trim_output(true);
                    print_single_space();
                }
            }
            else if (prefix === 'NEWLINE') {
                if (is_special_word(last_text)) {
                    // no newline between 'return nnn'
                    print_single_space();
                }
                else if (last_type !== 'TK_END_EXPR') {
                    if ((last_type !== 'TK_START_EXPR' || token_text !== 'var') && last_text !== ':') {
                        // no need to force newline on 'var': for (var x = 0...)
                        if (token_text === 'if' && last_word === 'else' && last_text !== '{') {
                            // no newline for } else if {
                            print_single_space();
                        }
                        else {
                            flags.var_line = false;
                            flags.var_line_reindented = false;
                            print_newline();
                        }
                    }
                }
                else if (in_array(token_text, line_starters) && last_text != ')') {
                    flags.var_line = false;
                    flags.var_line_reindented = false;
                    print_newline();
                }
            }
            else if (is_array(flags.mode) && last_text === ',' && last_last_text === '}') {
                print_newline(); // }, in lists get a newline treatment
            }
            else if (prefix === 'SPACE') {
                print_single_space();
            }
            print_token();
            last_word = token_text;
            if (token_text === 'var') {
                flags.var_line = true;
                flags.var_line_reindented = false;
                flags.var_line_tainted = false;
            }
            if (token_text === 'if') {
                flags.if_line = true;
            }
            if (token_text === 'else') {
                flags.if_line = false;
            }
            break;
        case 'TK_SEMICOLON':
            print_token();
            flags.var_line = false;
            flags.var_line_reindented = false;
            if (flags.mode == 'OBJECT') {
                // OBJECT mode is weird and doesn't get reset too well.
                flags.mode = 'BLOCK';
            }
            break;
        case 'TK_STRING':
            if (last_type === 'TK_END_EXPR' && in_array(flags.previous_mode, ['(COND-EXPRESSION)', '(FOR-EXPRESSION)'])) {
                print_single_space();
            }
            else if (last_type === 'TK_COMMENT' || last_type == 'TK_STRING' || last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_SEMICOLON') {
                print_newline();
            }
            else if (last_type === 'TK_WORD') {
                print_single_space();
            }
            print_token();
            break;
        case 'TK_EQUALS':
            if (flags.var_line) {
                // just got an '=' in a var-line, different formatting/line-breaking, etc will now be done
                flags.var_line_tainted = true;
            }
            print_single_space();
            print_token();
            print_single_space();
            break;
        case 'TK_COMMA':
            if (flags.var_line) {
                if (is_expression(flags.mode)) {
                    // do not break on comma, for(var a = 1, b = 2)
                    flags.var_line_tainted = false;
                }
                if (flags.var_line_tainted) {
                    print_token();
                    flags.var_line_reindented = true;
                    flags.var_line_tainted = false;
                    print_newline();
                    break;
                }
                else {
                    flags.var_line_tainted = false;
                }
                print_token();
                print_single_space();
                break;
            }
            if (last_type == 'TK_COMMENT') {
                print_newline();
            }
            if (last_type === 'TK_END_BLOCK' && flags.mode !== "(EXPRESSION)") {
                print_token();
                if (flags.mode === 'OBJECT' && last_text === '}') {
                    print_newline();
                }
                else {
                    print_single_space();
                }
            }
            else {
                if (flags.mode === 'OBJECT') {
                    print_token();
                    print_newline();
                }
                else {
                    // EXPR or DO_BLOCK
                    print_token();
                    print_single_space();
                }
            }
            break;
        case 'TK_OPERATOR':
            var space_before = true;
            var space_after = true;
            if (is_special_word(last_text)) {
                // "return" had a special handling in TK_WORD. Now we need to return the favor
                print_single_space();
                print_token();
                break;
            }
            // hack for actionscript's import .*;
            if (token_text == '*' && last_type == 'TK_UNKNOWN' && !last_last_text.match(/^\d+$/)) {
                print_token();
                break;
            }
            if (token_text === ':' && flags.in_case) {
                if (opt_indent_case) flags.case_body = true;
                print_token(); // colon really asks for separate treatment
                print_newline();
                flags.in_case = false;
                break;
            }
            if (token_text === '::') {
                // no spaces around exotic namespacing syntax operator
                print_token();
                break;
            }
            if (in_array(token_text, ['--', '++', '!']) || (in_array(token_text, ['-', '+']) && (in_array(last_type, ['TK_START_BLOCK', 'TK_START_EXPR', 'TK_EQUALS', 'TK_OPERATOR']) || in_array(last_text, line_starters)))) {
                // unary operators (and binary +/- pretending to be unary) special cases
                space_before = false;
                space_after = false;
                if (last_text === ';' && is_expression(flags.mode)) {
                    // for (;; ++i)
                    //        ^^^
                    space_before = true;
                }
                if (last_type === 'TK_WORD' && in_array(last_text, line_starters)) {
                    space_before = true;
                }
                if (flags.mode === 'BLOCK' && (last_text === '{' || last_text === ';')) {
                    // { foo; --i }
                    // foo(); --bar;
                    print_newline();
                }
            }
            else if (token_text === '.') {
                // decimal digits or object.property
                space_before = false;
            }
            else if (token_text === ':') {
                if (flags.ternary_depth == 0) {
                    if (flags.mode == 'BLOCK') {
                        flags.mode = 'OBJECT';
                    }
                    space_before = false;
                }
                else {
                    flags.ternary_depth -= 1;
                }
            }
            else if (token_text === '?') {
                flags.ternary_depth += 1;
            }
            if (space_before) {
                print_single_space();
            }
            print_token();
            if (space_after) {
                print_single_space();
            }
            break;
        case 'TK_BLOCK_COMMENT':
            var lines = split_newlines(token_text);
            if (all_lines_start_with(lines.slice(1), '*')) {
                // javadoc: reformat and reindent
                print_newline();
                output.push(lines[0]);
                for (i = 1; i < lines.length; i++) {
                    print_newline();
                    output.push(' ');
                    output.push(trim(lines[i]));
                }
            }
            else {
                // simple block comment: leave intact
                if (lines.length > 1) {
                    // multiline comment block starts with a new line
                    print_newline();
                }
                else {
                    // single-line /* comment */ stays where it is
                    if (last_type === 'TK_END_BLOCK') {
                        print_newline();
                    }
                    else {
                        print_single_space();
                    }
                }
                for (i = 0; i < lines.length; i++) {
                    output.push(lines[i]);
                    output.push("\n");
                }
            }
            if (look_up('\n') != '\n') print_newline();
            break;
        case 'TK_INLINE_COMMENT':
            print_single_space();
            print_token();
            if (is_expression(flags.mode)) {
                print_single_space();
            }
            else {
                force_newline();
            }
            break;
        case 'TK_COMMENT':
            if (last_text == ',' && !wanted_newline) {
                trim_output(true);
            }
            if (last_type != 'TK_COMMENT') {
                if (wanted_newline) {
                    print_newline();
                }
                else {
                    print_single_space();
                }
            }
            print_token();
            break;
        case 'TK_UNKNOWN':
            if (is_special_word(last_text)) {
                print_single_space();
            }
            print_token();
            break;
        }
        last_last_text = last_text;
        last_type = token_type;
        last_text = token_text;
    }
    var sweet_code = preindent_string + output.join('').replace(/[\r\n ]+$/, '');
    return sweet_code;
}
// Add support for CommonJS. Just put this file somewhere on your require.paths
// and you will be able to `var js_beautify = require("beautify").js_beautify`.
if (typeof exports !== "undefined") exports.js_beautify = js_beautify;
/* ==================== beautify_css.js ==================== */
/*

 CSS Beautifier
---------------

    Written by Harutyun Amirjanyan, (amirjanyan@gmail.com)

    Based on code initially developed by: Einar Lielmanis, <elfz@laacz.lv>
        http://jsbeautifier.org/


    You are free to use this in any way you want, in case you find this useful or working for you.

    Usage:
        css_beautify(source_text);
        css_beautify(source_text, options);

    The options are:
        indent_size (default 4)          — indentation size,
        indent_char (default space)      — character to indent with,

    e.g

    css_beautify(css_source_text, {
      'indent_size': 1,
      'indent_char': '\t'
    });
*/
// http://www.w3.org/TR/CSS21/syndata.html#tokenization
// http://www.w3.org/TR/css3-syntax/
function css_beautify(source_text, options) {
    options = options || {};
    var indentSize = options.indent_size || 4;
    var indentCharacter = options.indent_char || ' ';
    // compatibility
    if (typeof indentSize == "string") indentSize = parseInt(indentSize);
    // tokenizer
    var whiteRe = /^\s+$/;
    var wordRe = /[\w$\-_]/;
    var pos = -1,
        ch;

    function next() {
        return ch = source_text.charAt(++pos)
    }

    function peek() {
        return source_text.charAt(pos + 1)
    }

    function eatString(comma) {
        var start = pos;
        while (next()) {
            if (ch == "\\") {
                next();
                next();
            }
            else if (ch == comma) {
                break;
            }
            else if (ch == "\n") {
                break;
            }
        }
        return source_text.substring(start, pos + 1);
    }

    function eatWhitespace() {
        var start = pos;
        while (whiteRe.test(peek()))
        pos++;
        return pos != start;
    }

    function skipWhitespace() {
        var start = pos;
        do {} while (whiteRe.test(next()))
        return pos != start + 1;
    }

    function eatComment() {
        var start = pos;
        next();
        while (next()) {
            if (ch == "*" && peek() == "/") {
                pos++;
                break;
            }
        }
        return source_text.substring(start, pos + 1);
    }

    function lookBack(str, index) {
        return output.slice(-str.length + (index || 0), index).join("").toLowerCase() == str;
    }
    // printer
    var indentString = source_text.match(/^[\r\n]*[\t ]*/)[0];
    var singleIndent = Array(indentSize + 1).join(indentCharacter);
    var indentLevel = 0;

    function indent() {
        indentLevel++;
        indentString += singleIndent;
    }

    function outdent() {
        indentLevel--;
        indentString = indentString.slice(0, - indentSize);
    }
    print = {}
    print["{"] = function (ch) {
        print.singleSpace();
        output.push(ch);
        print.newLine();
    }
    print["}"] = function (ch) {
        print.newLine();
        output.push(ch);
        print.newLine();
    }
    print.newLine = function (keepWhitespace) {
        if (!keepWhitespace) while (whiteRe.test(output[output.length - 1]))
        output.pop();
        if (output.length) output.push('\n');
        if (indentString) output.push(indentString);
    }
    print.singleSpace = function () {
        if (output.length && !whiteRe.test(output[output.length - 1])) output.push(' ');
    }
    var output = [];
    if (indentString) output.push(indentString);
    /*_____________________--------------------_____________________*/
    while (true) {
        var isAfterSpace = skipWhitespace();
        if (!ch) break;
        if (ch == '{') {
            indent();
            print["{"](ch);
        }
        else if (ch == '}') {
            outdent();
            print["}"](ch);
        }
        else if (ch == '"' || ch == '\'') {
            output.push(eatString(ch))
        }
        else if (ch == ';') {
            output.push(ch, '\n', indentString);
        }
        else if (ch == '/' && peek() == '*') { // comment
            print.newLine();
            output.push(eatComment(), "\n", indentString);
        }
        else if (ch == '(') { // may be a url
            output.push(ch);
            eatWhitespace();
            if (lookBack("url", - 1) && next()) {
                if (ch != ')' && ch != '"' && ch != '\'') output.push(eatString(')'));
                else pos--;
            }
        }
        else if (ch == ')') {
            output.push(ch);
        }
        else if (ch == ',') {
            eatWhitespace();
            output.push(ch);
            print.singleSpace();
        }
        else if (ch == ']') {
            output.push(ch);
        }
        else if (ch == '[' || ch == '=') { // no whitespace before or after
            eatWhitespace();
            output.push(ch);
        }
        else {
            if (isAfterSpace) print.singleSpace();
            output.push(ch);
        }
    }
    var sweetCode = output.join('').replace(/[\n ]+$/, '');
    return sweetCode;
}
if (typeof exports !== "undefined") exports.css_beautify = css_beautify;
/* ==================== beautify_html.js ==================== */
/*

 Style HTML
---------------

  Written by Nochum Sossonko, (nsossonko@hotmail.com)

  Based on code initially developed by: Einar Lielmanis, <elfz@laacz.lv>
    http://jsbeautifier.org/


  You are free to use this in any way you want, in case you find this useful or working for you.

  Usage:
    style_html(html_source);

    style_html(html_source, options);

  The options are:
    indent_size (default 4)          — indentation size,
    indent_char (default space)      — character to indent with,
    max_char (default 70)            -  maximum amount of characters per line,
    brace_style (default "collapse") - "collapse" | "expand" | "end-expand"
            put braces on the same line as control statements (default), or put braces on own line (Allman / ANSI style), or just put end braces on own line.
    unformatted (default ['a'])      - list of tags, that shouldn't be reformatted
    indent_scripts (default normal)  - "keep"|"separate"|"normal"

    e.g.

    style_html(html_source, {
      'indent_size': 2,
      'indent_char': ' ',
      'max_char': 78,
      'brace_style': 'expand',
      'unformatted': ['a', 'sub', 'sup', 'b', 'i', 'u']
    });
*/
function style_html(html_source, options) {
    //Wrapper function to invoke all the necessary constructors and deal with the output.
    var multi_parser,
    indent_size,
    indent_character,
    max_char,
    brace_style;
    options = options || {};
    indent_size = options.indent_size || 4;
    indent_character = options.indent_char || ' ';
    brace_style = options.brace_style || 'collapse';
    max_char = options.max_char == 0 ? Infinity : options.max_char || 70;
    unformatted = options.unformatted || ['a'];

    function Parser() {
        this.pos = 0; //Parser position
        this.token = '';
        this.current_mode = 'CONTENT'; //reflects the current Parser mode: TAG/CONTENT
        this.tags = { //An object to hold tags, their position, and their parent-tags, initiated with default values
            parent: 'parent1',
            parentcount: 1,
            parent1: ''
        };
        this.tag_type = '';
        this.token_text = this.last_token = this.last_text = this.token_type = '';
        this.Utils = { //Uilities made available to the various functions
            whitespace: "\n\r\t ".split(''),
            single_token: 'br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed'.split(','), //all the single tags for HTML
            extra_liners: 'head,body,/html'.split(','), //for tags that need a line of whitespace before them
            in_array: function (what, arr) {
                for (var i = 0; i < arr.length; i++) {
                    if (what === arr[i]) {
                        return true;
                    }
                }
                return false;
            }
        }
        this.get_content = function () { //function to capture regular content between tags
            var input_char = '';
            var content = [];
            var space = false; //if a space is needed
            while (this.input.charAt(this.pos) !== '<') {
                if (this.pos >= this.input.length) {
                    return content.length ? content.join('') : ['', 'TK_EOF'];
                }
                input_char = this.input.charAt(this.pos);
                this.pos++;
                this.line_char_count++;
                if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
                    if (content.length) {
                        space = true;
                    }
                    this.line_char_count--;
                    continue; //don't want to insert unnecessary space
                }
                else if (space) {
                    if (this.line_char_count >= this.max_char) { //insert a line when the max_char is reached
                        content.push('\n');
                        for (var i = 0; i < this.indent_level; i++) {
                            content.push(this.indent_string);
                        }
                        this.line_char_count = 0;
                    }
                    else {
                        content.push(' ');
                        this.line_char_count++;
                    }
                    space = false;
                }
                content.push(input_char); //letter at-a-time (or string) inserted to an array
            }
            return content.length ? content.join('') : '';
        }
        this.get_contents_to = function (name) { //get the full content of a script or style to pass to js_beautify
            if (this.pos == this.input.length) {
                return ['', 'TK_EOF'];
            }
            var input_char = '';
            var content = '';
            var reg_match = new RegExp('\<\/' + name + '\\s*\>', 'igm');
            reg_match.lastIndex = this.pos;
            var reg_array = reg_match.exec(this.input);
            var end_script = reg_array ? reg_array.index : this.input.length; //absolute end of script
            if (this.pos < end_script) { //get everything in between the script tags
                content = this.input.substring(this.pos, end_script);
                this.pos = end_script;
            }
            return content;
        }
        this.record_tag = function (tag) { //function to record a tag and its parent in this.tags Object
            if (this.tags[tag + 'count']) { //check for the existence of this tag type
                this.tags[tag + 'count']++;
                this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
            }
            else { //otherwise initialize this tag type
                this.tags[tag + 'count'] = 1;
                this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
            }
            this.tags[tag + this.tags[tag + 'count'] + 'parent'] = this.tags.parent; //set the parent (i.e. in the case of a div this.tags.div1parent)
            this.tags.parent = tag + this.tags[tag + 'count']; //and make this the current parent (i.e. in the case of a div 'div1')
        }
        this.retrieve_tag = function (tag) { //function to retrieve the opening tag to the corresponding closer
            if (this.tags[tag + 'count']) { //if the openener is not in the Object we ignore it
                var temp_parent = this.tags.parent; //check to see if it's a closable tag.
                while (temp_parent) { //till we reach '' (the initial value);
                    if (tag + this.tags[tag + 'count'] === temp_parent) { //if this is it use it
                        break;
                    }
                    temp_parent = this.tags[temp_parent + 'parent']; //otherwise keep on climbing up the DOM Tree
                }
                if (temp_parent) { //if we caught something
                    this.indent_level = this.tags[tag + this.tags[tag + 'count']]; //set the indent_level accordingly
                    this.tags.parent = this.tags[temp_parent + 'parent']; //and set the current parent
                }
                delete this.tags[tag + this.tags[tag + 'count'] + 'parent']; //delete the closed tags parent reference...
                delete this.tags[tag + this.tags[tag + 'count']]; //...and the tag itself
                if (this.tags[tag + 'count'] == 1) {
                    delete this.tags[tag + 'count'];
                }
                else {
                    this.tags[tag + 'count']--;
                }
            }
        }
        this.get_tag = function () { //function to get a full tag and parse its type
            var input_char = '';
            var content = [];
            var space = false;
            do {
                if (this.pos >= this.input.length) {
                    return content.length ? content.join('') : ['', 'TK_EOF'];
                }
                input_char = this.input.charAt(this.pos);
                this.pos++;
                this.line_char_count++;
                if (this.Utils.in_array(input_char, this.Utils.whitespace)) { //don't want to insert unnecessary space
                    space = true;
                    this.line_char_count--;
                    continue;
                }
                if (input_char === "'" || input_char === '"') {
                    if (!content[1] || content[1] !== '!') { //if we're in a comment strings don't get treated specially
                        input_char += this.get_unformatted(input_char);
                        space = true;
                    }
                }
                if (input_char === '=') { //no space before =
                    space = false;
                }
                if (content.length && content[content.length - 1] !== '=' && input_char !== '>' && space) { //no space after = or before >
                    if (this.line_char_count >= this.max_char) {
                        this.print_newline(false, content);
                        this.line_char_count = 0;
                    }
                    else {
                        content.push(' ');
                        this.line_char_count++;
                    }
                    space = false;
                }
                content.push(input_char); //inserts character at-a-time (or string)
            } while (input_char !== '>');
            var tag_complete = content.join('');
            var tag_index;
            if (tag_complete.indexOf(' ') != -1) { //if there's whitespace, thats where the tag name ends
                tag_index = tag_complete.indexOf(' ');
            }
            else { //otherwise go with the tag ending
                tag_index = tag_complete.indexOf('>');
            }
            var tag_check = tag_complete.substring(1, tag_index).toLowerCase();
            if (tag_complete.charAt(tag_complete.length - 2) === '/' || this.Utils.in_array(tag_check, this.Utils.single_token)) { //if this tag name is a single tag type (either in the list or has a closing /)
                this.tag_type = 'SINGLE';
            }
            else if (tag_check === 'script') { //for later script handling
                this.record_tag(tag_check);
                this.tag_type = 'SCRIPT';
            }
            else if (tag_check === 'style') { //for future style handling (for now it justs uses get_content)
                this.record_tag(tag_check);
                this.tag_type = 'STYLE';
            }
            else if (this.Utils.in_array(tag_check, unformatted)) { // do not reformat the "unformatted" tags
                var comment = this.get_unformatted('</' + tag_check + '>', tag_complete); //...delegate to get_unformatted function
                content.push(comment);
                this.tag_type = 'SINGLE';
            }
            else if (tag_check.charAt(0) === '!') { //peek for <!-- comment
                if (tag_check.indexOf('[if') != -1) { //peek for <!--[if conditional comment
                    if (tag_complete.indexOf('!IE') != -1) { //this type needs a closing --> so...
                        var comment = this.get_unformatted('-->', tag_complete); //...delegate to get_unformatted
                        content.push(comment);
                    }
                    this.tag_type = 'START';
                }
                else if (tag_check.indexOf('[endif') != -1) { //peek for <!--[endif end conditional comment
                    this.tag_type = 'END';
                    this.unindent();
                }
                else if (tag_check.indexOf('[cdata[') != -1) { //if it's a <[cdata[ comment...
                    var comment = this.get_unformatted(']]>', tag_complete); //...delegate to get_unformatted function
                    content.push(comment);
                    this.tag_type = 'SINGLE'; //<![CDATA[ comments are treated like single tags
                }
                else {
                    var comment = this.get_unformatted('-->', tag_complete);
                    content.push(comment);
                    this.tag_type = 'SINGLE';
                }
            }
            else {
                if (tag_check.charAt(0) === '/') { //this tag is a double tag so check for tag-ending
                    this.retrieve_tag(tag_check.substring(1)); //remove it and all ancestors
                    this.tag_type = 'END';
                }
                else { //otherwise it's a start-tag
                    this.record_tag(tag_check); //push it on the tag stack
                    this.tag_type = 'START';
                }
                if (this.Utils.in_array(tag_check, this.Utils.extra_liners)) { //check if this double needs an extra line
                    this.print_newline(true, this.output);
                }
            }
            return content.join(''); //returns fully formatted tag
        }
        this.get_unformatted = function (delimiter, orig_tag) { //function to return unformatted content in its entirety
            if (orig_tag && orig_tag.indexOf(delimiter) != -1) {
                return '';
            }
            var input_char = '';
            var content = '';
            var space = true;
            do {
                if (this.pos >= this.input.length) {
                    return content;
                }
                input_char = this.input.charAt(this.pos);
                this.pos++
                if (this.Utils.in_array(input_char, this.Utils.whitespace)) {
                    if (!space) {
                        this.line_char_count--;
                        continue;
                    }
                    if (input_char === '\n' || input_char === '\r') {
                        content += '\n';
                        /*  Don't change tab indention for unformatted blocks.  If using code for html editing, this will greatly affect <pre> tags if they are specified in the 'unformatted array'
            for (var i=0; i<this.indent_level; i++) {
              content += this.indent_string;
            }
            space = false; //...and make sure other indentation is erased
            */
                        this.line_char_count = 0;
                        continue;
                    }
                }
                content += input_char;
                this.line_char_count++;
                space = true;
            } while (content.indexOf(delimiter) == -1);
            return content;
        }
        this.get_token = function () { //initial handler for token-retrieval
            var token;
            if (this.last_token === 'TK_TAG_SCRIPT' || this.last_token === 'TK_TAG_STYLE') { //check if we need to format javascript
                var type = this.last_token.substr(7)
                token = this.get_contents_to(type);
                if (typeof token !== 'string') {
                    return token;
                }
                return [token, 'TK_' + type];
            }
            if (this.current_mode === 'CONTENT') {
                token = this.get_content();
                if (typeof token !== 'string') {
                    return token;
                }
                else {
                    return [token, 'TK_CONTENT'];
                }
            }
            if (this.current_mode === 'TAG') {
                token = this.get_tag();
                if (typeof token !== 'string') {
                    return token;
                }
                else {
                    var tag_name_type = 'TK_TAG_' + this.tag_type;
                    return [token, tag_name_type];
                }
            }
        }
        this.get_full_indent = function (level) {
            level = this.indent_level + level || 0;
            if (level < 1) return '';
            return Array(level + 1).join(this.indent_string);
        }
        this.printer = function (js_source, indent_character, indent_size, max_char, brace_style) { //handles input/output and some other printing functions
            this.input = js_source || ''; //gets the input for the Parser
            this.output = [];
            this.indent_character = indent_character;
            this.indent_string = '';
            this.indent_size = indent_size;
            this.brace_style = brace_style;
            this.indent_level = 0;
            this.max_char = max_char;
            this.line_char_count = 0; //count to see if max_char was exceeded
            for (var i = 0; i < this.indent_size; i++) {
                this.indent_string += this.indent_character;
            }
            this.print_newline = function (ignore, arr) {
                this.line_char_count = 0;
                if (!arr || !arr.length) {
                    return;
                }
                if (!ignore) { //we might want the extra line
                    while (this.Utils.in_array(arr[arr.length - 1], this.Utils.whitespace)) {
                        arr.pop();
                    }
                }
                arr.push('\n');
                for (var i = 0; i < this.indent_level; i++) {
                    arr.push(this.indent_string);
                }
            }
            this.print_token = function (text) {
                this.output.push(text);
            }
            this.indent = function () {
                this.indent_level++;
            }
            this.unindent = function () {
                if (this.indent_level > 0) {
                    this.indent_level--;
                }
            }
        }
        return this;
    }
    /*_____________________--------------------_____________________*/
    multi_parser = new Parser(); //wrapping functions Parser
    multi_parser.printer(html_source, indent_character, indent_size, max_char, brace_style); //initialize starting values
    while (true) {
        var t = multi_parser.get_token();
        multi_parser.token_text = t[0];
        multi_parser.token_type = t[1];
        if (multi_parser.token_type === 'TK_EOF') {
            break;
        }
        switch (multi_parser.token_type) {
        case 'TK_TAG_START':
            multi_parser.print_newline(false, multi_parser.output);
            multi_parser.print_token(multi_parser.token_text);
            multi_parser.indent();
            multi_parser.current_mode = 'CONTENT';
            break;
        case 'TK_TAG_STYLE':
        case 'TK_TAG_SCRIPT':
            multi_parser.print_newline(false, multi_parser.output);
            multi_parser.print_token(multi_parser.token_text);
            multi_parser.current_mode = 'CONTENT';
            break;
        case 'TK_TAG_END':
            //Print new line only if the tag has no content and has child
            if (multi_parser.last_token === 'TK_CONTENT' && multi_parser.last_text === '') {
                var tag_name = multi_parser.token_text.match(/\w+/)[0];
                var tag_extracted_from_last_output = multi_parser.output[multi_parser.output.length - 1].match(/<\s*(\w+)/);
                if (tag_extracted_from_last_output === null || tag_extracted_from_last_output[1] !== tag_name) multi_parser.print_newline(true, multi_parser.output);
            }
            multi_parser.print_token(multi_parser.token_text);
            multi_parser.current_mode = 'CONTENT';
            break;
        case 'TK_TAG_SINGLE':
            multi_parser.print_newline(false, multi_parser.output);
            multi_parser.print_token(multi_parser.token_text);
            multi_parser.current_mode = 'CONTENT';
            break;
        case 'TK_CONTENT':
            if (multi_parser.token_text !== '') {
                multi_parser.print_token(multi_parser.token_text);
            }
            multi_parser.current_mode = 'TAG';
            break;
        case 'TK_STYLE':
        case 'TK_SCRIPT':
            if (multi_parser.token_text !== '') {
                multi_parser.output.push('\n');
                var text = multi_parser.token_text;
                if (multi_parser.token_type == 'TK_SCRIPT') {
                    var _beautifier = typeof js_beautify == 'function' && js_beautify;
                }
                else if (multi_parser.token_type == 'TK_STYLE') {
                    var _beautifier = typeof css_beautify == 'function' && css_beautify;
                }
                if (options.indent_scripts == "keep") {
                    var script_indent_level = 0;
                }
                else if (options.indent_scripts == "separate") {
                    var script_indent_level = -multi_parser.indent_level;
                }
                else {
                    var script_indent_level = 1;
                }
                var indentation = multi_parser.get_full_indent(script_indent_level);
                if (_beautifier) {
                    // call the Beautifier if avaliable
                    text = _beautifier(text.replace(/^\s*/, indentation), options);
                }
                else {
                    // simply indent the string otherwise
                    var white = text.match(/^\s*/)[0];
                    var _level = white.match(/[^\n\r]*$/)[0].split(multi_parser.indent_string).length - 1;
                    var reindent = multi_parser.get_full_indent(script_indent_level - _level);
                    text = text.replace(/^\s*/, indentation).replace(/\r\n|\r|\n/g, '\n' + reindent).replace(/\s*$/, '');
                }
                if (text) {
                    multi_parser.print_token(text);
                    multi_parser.print_newline(true, multi_parser.output);
                }
            }
            multi_parser.current_mode = 'TAG';
            break;
        }
        multi_parser.last_token = multi_parser.token_type;
        multi_parser.last_text = multi_parser.token_text;
    }
    return multi_parser.output.join('');
}

/* ==================== Zend Coding ==================== */
/**
 * Zen Coding 
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
 
zen_coding = (function(){
/**
 * Zen Coding settings
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
var zen_settings = {
	/** 
	 * Variables that can be placed inside snippets or abbreviations as ${variable}
	 * ${child} variable is reserved, don't use it 
	 */
	'variables': {
		'lang': 'en',
		'locale': 'en-US',
		'charset': 'UTF-8',
		'profile': 'xhtml',
		
		/** Inner element indentation */
		'indentation': '\t'     // TODO take from Aptana settings
	},
	
	'css': {
		'snippets': {
			"@i": "@import url(|);",
			"@m": "@media print {\n\t|\n}",
			"@f": "@font-face {\n\tfont-family:|;\n\tsrc:url(|);\n}",
			"!": "!important",
			"pos": "position:|;",
			"pos:s": "position:static;",
			"pos:a": "position:absolute;",
			"pos:r": "position:relative;",
			"pos:f": "position:fixed;",
			"t": "top:|;",
			"t:a": "top:auto;",
			"r": "right:|;",
			"r:a": "right:auto;",
			"b": "bottom:|;",
			"b:a": "bottom:auto;",
			"l": "left:|;",
			"l:a": "left:auto;",
			"z": "z-index:|;",
			"z:a": "z-index:auto;",
			"fl": "float:|;",
			"fl:n": "float:none;",
			"fl:l": "float:left;",
			"fl:r": "float:right;",
			"cl": "clear:|;",
			"cl:n": "clear:none;",
			"cl:l": "clear:left;",
			"cl:r": "clear:right;",
			"cl:b": "clear:both;",
			"d": "display:|;",
			"d:n": "display:none;",
			"d:b": "display:block;",
			"d:i": "display:inline;",
			"d:ib": "display:inline-block;",
			"d:li": "display:list-item;",
			"d:ri": "display:run-in;",
			"d:cp": "display:compact;",
			"d:tb": "display:table;",
			"d:itb": "display:inline-table;",
			"d:tbcp": "display:table-caption;",
			"d:tbcl": "display:table-column;",
			"d:tbclg": "display:table-column-group;",
			"d:tbhg": "display:table-header-group;",
			"d:tbfg": "display:table-footer-group;",
			"d:tbr": "display:table-row;",
			"d:tbrg": "display:table-row-group;",
			"d:tbc": "display:table-cell;",
			"d:rb": "display:ruby;",
			"d:rbb": "display:ruby-base;",
			"d:rbbg": "display:ruby-base-group;",
			"d:rbt": "display:ruby-text;",
			"d:rbtg": "display:ruby-text-group;",
			"v": "visibility:|;",
			"v:v": "visibility:visible;",
			"v:h": "visibility:hidden;",
			"v:c": "visibility:collapse;",
			"ov": "overflow:|;",
			"ov:v": "overflow:visible;",
			"ov:h": "overflow:hidden;",
			"ov:s": "overflow:scroll;",
			"ov:a": "overflow:auto;",
			"ovx": "overflow-x:|;",
			"ovx:v": "overflow-x:visible;",
			"ovx:h": "overflow-x:hidden;",
			"ovx:s": "overflow-x:scroll;",
			"ovx:a": "overflow-x:auto;",
			"ovy": "overflow-y:|;",
			"ovy:v": "overflow-y:visible;",
			"ovy:h": "overflow-y:hidden;",
			"ovy:s": "overflow-y:scroll;",
			"ovy:a": "overflow-y:auto;",
			"ovs": "overflow-style:|;",
			"ovs:a": "overflow-style:auto;",
			"ovs:s": "overflow-style:scrollbar;",
			"ovs:p": "overflow-style:panner;",
			"ovs:m": "overflow-style:move;",
			"ovs:mq": "overflow-style:marquee;",
			"zoo": "zoom:1;",
			"cp": "clip:|;",
			"cp:a": "clip:auto;",
			"cp:r": "clip:rect(|);",
			"bxz": "box-sizing:|;",
			"bxz:cb": "box-sizing:content-box;",
			"bxz:bb": "box-sizing:border-box;",
			"bxsh": "box-shadow:|;",
			"bxsh:n": "box-shadow:none;",
			"bxsh:w": "-webkit-box-shadow:0 0 0 #000;",
			"bxsh:m": "-moz-box-shadow:0 0 0 0 #000;",
			"m": "margin:|;",
			"m:a": "margin:auto;",
			"m:0": "margin:0;",
			"m:2": "margin:0 0;",
			"m:3": "margin:0 0 0;",
			"m:4": "margin:0 0 0 0;",
			"mt": "margin-top:|;",
			"mt:a": "margin-top:auto;",
			"mr": "margin-right:|;",
			"mr:a": "margin-right:auto;",
			"mb": "margin-bottom:|;",
			"mb:a": "margin-bottom:auto;",
			"ml": "margin-left:|;",
			"ml:a": "margin-left:auto;",
			"p": "padding:|;",
			"p:0": "padding:0;",
			"p:2": "padding:0 0;",
			"p:3": "padding:0 0 0;",
			"p:4": "padding:0 0 0 0;",
			"pt": "padding-top:|;",
			"pr": "padding-right:|;",
			"pb": "padding-bottom:|;",
			"pl": "padding-left:|;",
			"w": "width:|;",
			"w:a": "width:auto;",
			"h": "height:|;",
			"h:a": "height:auto;",
			"maw": "max-width:|;",
			"maw:n": "max-width:none;",
			"mah": "max-height:|;",
			"mah:n": "max-height:none;",
			"miw": "min-width:|;",
			"mih": "min-height:|;",
			"o": "outline:|;",
			"o:n": "outline:none;",
			"oo": "outline-offset:|;",
			"ow": "outline-width:|;",
			"os": "outline-style:|;",
			"oc": "outline-color:#000;",
			"oc:i": "outline-color:invert;",
			"bd": "border:|;",
			"bd+": "border:1px solid #000;",
			"bd:n": "border:none;",
			"bdbk": "border-break:|;",
			"bdbk:c": "border-break:close;",
			"bdcl": "border-collapse:|;",
			"bdcl:c": "border-collapse:collapse;",
			"bdcl:s": "border-collapse:separate;",
			"bdc": "border-color:#000;",
			"bdi": "border-image:url(|);",
			"bdi:n": "border-image:none;",
			"bdi:w": "-webkit-border-image:url(|) 0 0 0 0 stretch stretch;",
			"bdi:m": "-moz-border-image:url(|) 0 0 0 0 stretch stretch;",
			"bdti": "border-top-image:url(|);",
			"bdti:n": "border-top-image:none;",
			"bdri": "border-right-image:url(|);",
			"bdri:n": "border-right-image:none;",
			"bdbi": "border-bottom-image:url(|);",
			"bdbi:n": "border-bottom-image:none;",
			"bdli": "border-left-image:url(|);",
			"bdli:n": "border-left-image:none;",
			"bdci": "border-corner-image:url(|);",
			"bdci:n": "border-corner-image:none;",
			"bdci:c": "border-corner-image:continue;",
			"bdtli": "border-top-left-image:url(|);",
			"bdtli:n": "border-top-left-image:none;",
			"bdtli:c": "border-top-left-image:continue;",
			"bdtri": "border-top-right-image:url(|);",
			"bdtri:n": "border-top-right-image:none;",
			"bdtri:c": "border-top-right-image:continue;",
			"bdbri": "border-bottom-right-image:url(|);",
			"bdbri:n": "border-bottom-right-image:none;",
			"bdbri:c": "border-bottom-right-image:continue;",
			"bdbli": "border-bottom-left-image:url(|);",
			"bdbli:n": "border-bottom-left-image:none;",
			"bdbli:c": "border-bottom-left-image:continue;",
			"bdf": "border-fit:|;",
			"bdf:c": "border-fit:clip;",
			"bdf:r": "border-fit:repeat;",
			"bdf:sc": "border-fit:scale;",
			"bdf:st": "border-fit:stretch;",
			"bdf:ow": "border-fit:overwrite;",
			"bdf:of": "border-fit:overflow;",
			"bdf:sp": "border-fit:space;",
			"bdl": "border-length:|;",
			"bdl:a": "border-length:auto;",
			"bdsp": "border-spacing:|;",
			"bds": "border-style:|;",
			"bds:n": "border-style:none;",
			"bds:h": "border-style:hidden;",
			"bds:dt": "border-style:dotted;",
			"bds:ds": "border-style:dashed;",
			"bds:s": "border-style:solid;",
			"bds:db": "border-style:double;",
			"bds:dtds": "border-style:dot-dash;",
			"bds:dtdtds": "border-style:dot-dot-dash;",
			"bds:w": "border-style:wave;",
			"bds:g": "border-style:groove;",
			"bds:r": "border-style:ridge;",
			"bds:i": "border-style:inset;",
			"bds:o": "border-style:outset;",
			"bdw": "border-width:|;",
			"bdt": "border-top:|;",
			"bdt+": "border-top:1px solid #000;",
			"bdt:n": "border-top:none;",
			"bdtw": "border-top-width:|;",
			"bdts": "border-top-style:|;",
			"bdts:n": "border-top-style:none;",
			"bdtc": "border-top-color:#000;",
			"bdr": "border-right:|;",
			"bdr+": "border-right:1px solid #000;",
			"bdr:n": "border-right:none;",
			"bdrw": "border-right-width:|;",
			"bdrs": "border-right-style:|;",
			"bdrs:n": "border-right-style:none;",
			"bdrc": "border-right-color:#000;",
			"bdb": "border-bottom:|;",
			"bdb+": "border-bottom:1px solid #000;",
			"bdb:n": "border-bottom:none;",
			"bdbw": "border-bottom-width:|;",
			"bdbs": "border-bottom-style:|;",
			"bdbs:n": "border-bottom-style:none;",
			"bdbc": "border-bottom-color:#000;",
			"bdl": "border-left:|;",
			"bdl+": "border-left:1px solid #000;",
			"bdl:n": "border-left:none;",
			"bdlw": "border-left-width:|;",
			"bdls": "border-left-style:|;",
			"bdls:n": "border-left-style:none;",
			"bdlc": "border-left-color:#000;",
			"bdrs": "border-radius:|;",
			"bdtrrs": "border-top-right-radius:|;",
			"bdtlrs": "border-top-left-radius:|;",
			"bdbrrs": "border-bottom-right-radius:|;",
			"bdblrs": "border-bottom-left-radius:|;",
			"bg": "background:|;",
			"bg+": "background:#FFF url(|) 0 0 no-repeat;",
			"bg:n": "background:none;",
			"bg:ie": "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='|x.png');",
			"bgc": "background-color:#FFF;",
			"bgi": "background-image:url(|);",
			"bgi:n": "background-image:none;",
			"bgr": "background-repeat:|;",
			"bgr:n": "background-repeat:no-repeat;",
			"bgr:x": "background-repeat:repeat-x;",
			"bgr:y": "background-repeat:repeat-y;",
			"bga": "background-attachment:|;",
			"bga:f": "background-attachment:fixed;",
			"bga:s": "background-attachment:scroll;",
			"bgp": "background-position:0 0;",
			"bgpx": "background-position-x:|;",
			"bgpy": "background-position-y:|;",
			"bgbk": "background-break:|;",
			"bgbk:bb": "background-break:bounding-box;",
			"bgbk:eb": "background-break:each-box;",
			"bgbk:c": "background-break:continuous;",
			"bgcp": "background-clip:|;",
			"bgcp:bb": "background-clip:border-box;",
			"bgcp:pb": "background-clip:padding-box;",
			"bgcp:cb": "background-clip:content-box;",
			"bgcp:nc": "background-clip:no-clip;",
			"bgo": "background-origin:|;",
			"bgo:pb": "background-origin:padding-box;",
			"bgo:bb": "background-origin:border-box;",
			"bgo:cb": "background-origin:content-box;",
			"bgz": "background-size:|;",
			"bgz:a": "background-size:auto;",
			"bgz:ct": "background-size:contain;",
			"bgz:cv": "background-size:cover;",
			"c": "color:#000;",
			"tbl": "table-layout:|;",
			"tbl:a": "table-layout:auto;",
			"tbl:f": "table-layout:fixed;",
			"cps": "caption-side:|;",
			"cps:t": "caption-side:top;",
			"cps:b": "caption-side:bottom;",
			"ec": "empty-cells:|;",
			"ec:s": "empty-cells:show;",
			"ec:h": "empty-cells:hide;",
			"lis": "list-style:|;",
			"lis:n": "list-style:none;",
			"lisp": "list-style-position:|;",
			"lisp:i": "list-style-position:inside;",
			"lisp:o": "list-style-position:outside;",
			"list": "list-style-type:|;",
			"list:n": "list-style-type:none;",
			"list:d": "list-style-type:disc;",
			"list:c": "list-style-type:circle;",
			"list:s": "list-style-type:square;",
			"list:dc": "list-style-type:decimal;",
			"list:dclz": "list-style-type:decimal-leading-zero;",
			"list:lr": "list-style-type:lower-roman;",
			"list:ur": "list-style-type:upper-roman;",
			"lisi": "list-style-image:|;",
			"lisi:n": "list-style-image:none;",
			"q": "quotes:|;",
			"q:n": "quotes:none;",
			"q:ru": "quotes:'\00AB' '\00BB' '\201E' '\201C';",
			"q:en": "quotes:'\201C' '\201D' '\2018' '\2019';",
			"ct": "content:|;",
			"ct:n": "content:normal;",
			"ct:oq": "content:open-quote;",
			"ct:noq": "content:no-open-quote;",
			"ct:cq": "content:close-quote;",
			"ct:ncq": "content:no-close-quote;",
			"ct:a": "content:attr(|);",
			"ct:c": "content:counter(|);",
			"ct:cs": "content:counters(|);",
			"coi": "counter-increment:|;",
			"cor": "counter-reset:|;",
			"va": "vertical-align:|;",
			"va:sup": "vertical-align:super;",
			"va:t": "vertical-align:top;",
			"va:tt": "vertical-align:text-top;",
			"va:m": "vertical-align:middle;",
			"va:bl": "vertical-align:baseline;",
			"va:b": "vertical-align:bottom;",
			"va:tb": "vertical-align:text-bottom;",
			"va:sub": "vertical-align:sub;",
			"ta": "text-align:|;",
			"ta:l": "text-align:left;",
			"ta:c": "text-align:center;",
			"ta:r": "text-align:right;",
			"tal": "text-align-last:|;",
			"tal:a": "text-align-last:auto;",
			"tal:l": "text-align-last:left;",
			"tal:c": "text-align-last:center;",
			"tal:r": "text-align-last:right;",
			"td": "text-decoration:|;",
			"td:n": "text-decoration:none;",
			"td:u": "text-decoration:underline;",
			"td:o": "text-decoration:overline;",
			"td:l": "text-decoration:line-through;",
			"te": "text-emphasis:|;",
			"te:n": "text-emphasis:none;",
			"te:ac": "text-emphasis:accent;",
			"te:dt": "text-emphasis:dot;",
			"te:c": "text-emphasis:circle;",
			"te:ds": "text-emphasis:disc;",
			"te:b": "text-emphasis:before;",
			"te:a": "text-emphasis:after;",
			"th": "text-height:|;",
			"th:a": "text-height:auto;",
			"th:f": "text-height:font-size;",
			"th:t": "text-height:text-size;",
			"th:m": "text-height:max-size;",
			"ti": "text-indent:|;",
			"ti:-": "text-indent:-9999px;",
			"tj": "text-justify:|;",
			"tj:a": "text-justify:auto;",
			"tj:iw": "text-justify:inter-word;",
			"tj:ii": "text-justify:inter-ideograph;",
			"tj:ic": "text-justify:inter-cluster;",
			"tj:d": "text-justify:distribute;",
			"tj:k": "text-justify:kashida;",
			"tj:t": "text-justify:tibetan;",
			"to": "text-outline:|;",
			"to+": "text-outline:0 0 #000;",
			"to:n": "text-outline:none;",
			"tr": "text-replace:|;",
			"tr:n": "text-replace:none;",
			"tt": "text-transform:|;",
			"tt:n": "text-transform:none;",
			"tt:c": "text-transform:capitalize;",
			"tt:u": "text-transform:uppercase;",
			"tt:l": "text-transform:lowercase;",
			"tw": "text-wrap:|;",
			"tw:n": "text-wrap:normal;",
			"tw:no": "text-wrap:none;",
			"tw:u": "text-wrap:unrestricted;",
			"tw:s": "text-wrap:suppress;",
			"tsh": "text-shadow:|;",
			"tsh+": "text-shadow:0 0 0 #000;",
			"tsh:n": "text-shadow:none;",
			"lh": "line-height:|;",
			"whs": "white-space:|;",
			"whs:n": "white-space:normal;",
			"whs:p": "white-space:pre;",
			"whs:nw": "white-space:nowrap;",
			"whs:pw": "white-space:pre-wrap;",
			"whs:pl": "white-space:pre-line;",
			"whsc": "white-space-collapse:|;",
			"whsc:n": "white-space-collapse:normal;",
			"whsc:k": "white-space-collapse:keep-all;",
			"whsc:l": "white-space-collapse:loose;",
			"whsc:bs": "white-space-collapse:break-strict;",
			"whsc:ba": "white-space-collapse:break-all;",
			"wob": "word-break:|;",
			"wob:n": "word-break:normal;",
			"wob:k": "word-break:keep-all;",
			"wob:l": "word-break:loose;",
			"wob:bs": "word-break:break-strict;",
			"wob:ba": "word-break:break-all;",
			"wos": "word-spacing:|;",
			"wow": "word-wrap:|;",
			"wow:nm": "word-wrap:normal;",
			"wow:n": "word-wrap:none;",
			"wow:u": "word-wrap:unrestricted;",
			"wow:s": "word-wrap:suppress;",
			"lts": "letter-spacing:|;",
			"f": "font:|;",
			"f+": "font:1em Arial,sans-serif;",
			"fw": "font-weight:|;",
			"fw:n": "font-weight:normal;",
			"fw:b": "font-weight:bold;",
			"fw:br": "font-weight:bolder;",
			"fw:lr": "font-weight:lighter;",
			"fs": "font-style:|;",
			"fs:n": "font-style:normal;",
			"fs:i": "font-style:italic;",
			"fs:o": "font-style:oblique;",
			"fv": "font-variant:|;",
			"fv:n": "font-variant:normal;",
			"fv:sc": "font-variant:small-caps;",
			"fz": "font-size:|;",
			"fza": "font-size-adjust:|;",
			"fza:n": "font-size-adjust:none;",
			"ff": "font-family:|;",
			"ff:s": "font-family:serif;",
			"ff:ss": "font-family:sans-serif;",
			"ff:c": "font-family:cursive;",
			"ff:f": "font-family:fantasy;",
			"ff:m": "font-family:monospace;",
			"fef": "font-effect:|;",
			"fef:n": "font-effect:none;",
			"fef:eg": "font-effect:engrave;",
			"fef:eb": "font-effect:emboss;",
			"fef:o": "font-effect:outline;",
			"fem": "font-emphasize:|;",
			"femp": "font-emphasize-position:|;",
			"femp:b": "font-emphasize-position:before;",
			"femp:a": "font-emphasize-position:after;",
			"fems": "font-emphasize-style:|;",
			"fems:n": "font-emphasize-style:none;",
			"fems:ac": "font-emphasize-style:accent;",
			"fems:dt": "font-emphasize-style:dot;",
			"fems:c": "font-emphasize-style:circle;",
			"fems:ds": "font-emphasize-style:disc;",
			"fsm": "font-smooth:|;",
			"fsm:a": "font-smooth:auto;",
			"fsm:n": "font-smooth:never;",
			"fsm:aw": "font-smooth:always;",
			"fst": "font-stretch:|;",
			"fst:n": "font-stretch:normal;",
			"fst:uc": "font-stretch:ultra-condensed;",
			"fst:ec": "font-stretch:extra-condensed;",
			"fst:c": "font-stretch:condensed;",
			"fst:sc": "font-stretch:semi-condensed;",
			"fst:se": "font-stretch:semi-expanded;",
			"fst:e": "font-stretch:expanded;",
			"fst:ee": "font-stretch:extra-expanded;",
			"fst:ue": "font-stretch:ultra-expanded;",
			"op": "opacity:|;",
			"op:ie": "filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=100);",
			"op:ms": "-ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity=100)';",
			"rz": "resize:|;",
			"rz:n": "resize:none;",
			"rz:b": "resize:both;",
			"rz:h": "resize:horizontal;",
			"rz:v": "resize:vertical;",
			"cur": "cursor:|;",
			"cur:a": "cursor:auto;",
			"cur:d": "cursor:default;",
			"cur:c": "cursor:crosshair;",
			"cur:ha": "cursor:hand;",
			"cur:he": "cursor:help;",
			"cur:m": "cursor:move;",
			"cur:p": "cursor:pointer;",
			"cur:t": "cursor:text;",
			"pgbb": "page-break-before:|;",
			"pgbb:au": "page-break-before:auto;",
			"pgbb:al": "page-break-before:always;",
			"pgbb:l": "page-break-before:left;",
			"pgbb:r": "page-break-before:right;",
			"pgbi": "page-break-inside:|;",
			"pgbi:au": "page-break-inside:auto;",
			"pgbi:av": "page-break-inside:avoid;",
			"pgba": "page-break-after:|;",
			"pgba:au": "page-break-after:auto;",
			"pgba:al": "page-break-after:always;",
			"pgba:l": "page-break-after:left;",
			"pgba:r": "page-break-after:right;",
			"orp": "orphans:|;",
			"wid": "widows:|;"
		}
	},
	
	'html': {
		'filters': 'html',
		'snippets': {
			'cc:ie6': '<!--[if lte IE 6]>\n\t${child}|\n<![endif]-->',
			'cc:ie': '<!--[if IE]>\n\t${child}|\n<![endif]-->',
			'cc:noie': '<!--[if !IE]><!-->\n\t${child}|\n<!--<![endif]-->',
			'html:4t': '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">\n' +
					'<html lang="${lang}">\n' +
					'<head>\n' +
					'	<meta http-equiv="Content-Type" content="text/html;charset=${charset}">\n' +
					'	<title></title>\n' +
					'</head>\n' +
					'<body>\n\t${child}|\n</body>\n' +
					'</html>',
			
			'html:4s': '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">\n' +
					'<html lang="${lang}">\n' +
					'<head>\n' +
					'	<meta http-equiv="Content-Type" content="text/html;charset=${charset}">\n' +
					'	<title></title>\n' +
					'</head>\n' +
					'<body>\n\t${child}|\n</body>\n' +
					'</html>',
			
			'html:xt': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n' +
					'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${lang}">\n' +
					'<head>\n' +
					'	<meta http-equiv="Content-Type" content="text/html;charset=${charset}" />\n' +
					'	<title></title>\n' +
					'</head>\n' +
					'<body>\n\t${child}|\n</body>\n' +
					'</html>',
			
			'html:xs': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n' +
					'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${lang}">\n' +
					'<head>\n' +
					'	<meta http-equiv="Content-Type" content="text/html;charset=${charset}" />\n' +
					'	<title></title>\n' +
					'</head>\n' +
					'<body>\n\t${child}|\n</body>\n' +
					'</html>',
			
			'html:xxs': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n' +
					'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${lang}">\n' +
					'<head>\n' +
					'	<meta http-equiv="Content-Type" content="text/html;charset=${charset}" />\n' +
					'	<title></title>\n' +
					'</head>\n' +
					'<body>\n\t${child}|\n</body>\n' +
					'</html>',
			
			'html:5': '<!DOCTYPE HTML>\n' +
					'<html lang="${locale}">\n' +
					'<head>\n' +
					'	<meta charset="${charset}">\n' +
					'	<title></title>\n' +
					'</head>\n' +
					'<body>\n\t${child}|\n</body>\n' +
					'</html>'
		},
		
		'abbreviations': {
			'a': '<a href=""></a>',
			'a:link': '<a href="http://|"></a>',
			'a:mail': '<a href="mailto:|"></a>',
			'abbr': '<abbr title=""></abbr>',
			'acronym': '<acronym title=""></acronym>',
			'base': '<base href="" />',
			'bdo': '<bdo dir=""></bdo>',
			'bdo:r': '<bdo dir="rtl"></bdo>',
			'bdo:l': '<bdo dir="ltr"></bdo>',
			'link:css': '<link rel="stylesheet" type="text/css" href="|style.css" media="all" />',
			'link:print': '<link rel="stylesheet" type="text/css" href="|print.css" media="print" />',
			'link:favicon': '<link rel="shortcut icon" type="image/x-icon" href="|favicon.ico" />',
			'link:touch': '<link rel="apple-touch-icon" href="|favicon.png" />',
			'link:rss': '<link rel="alternate" type="application/rss+xml" title="RSS" href="|rss.xml" />',
			'link:atom': '<link rel="alternate" type="application/atom+xml" title="Atom" href="atom.xml" />',
			'meta:utf': '<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />',
			'meta:win': '<meta http-equiv="Content-Type" content="text/html;charset=windows-1251" />',
			'meta:compat': '<meta http-equiv="X-UA-Compatible" content="IE=7" />',
			'style': '<style type="text/css"></style>',
			'script': '<script type="text/javascript"></script>',
			'script:src': '<script type="text/javascript" src=""></script>',
			'img': '<img src="" alt="" />',
			'iframe': '<iframe src="" frameborder="0"></iframe>',
			'embed': '<embed src="" type="" />',
			'object': '<object data="" type=""></object>',
			'param': '<param name="" value="" />',
			'map': '<map name=""></map>',
			'area': '<area shape="" coords="" href="" alt="" />',
			'area:d': '<area shape="default" href="" alt="" />',
			'area:c': '<area shape="circle" coords="" href="" alt="" />',
			'area:r': '<area shape="rect" coords="" href="" alt="" />',
			'area:p': '<area shape="poly" coords="" href="" alt="" />',
			'link': '<link rel="stylesheet" href="" />',
			'form': '<form action=""></form>',
			'form:get': '<form action="" method="get"></form>',
			'form:post': '<form action="" method="post"></form>',
			'label': '<label for=""></label>',
			'input': '<input type="" />',
			'input:hidden': '<input type="hidden" name="" />',
			'input:h': '<input type="hidden" name="" />',
			'input:text': '<input type="text" name="" id="" />',
			'input:t': '<input type="text" name="" id="" />',
			'input:search': '<input type="search" name="" id="" />',
			'input:email': '<input type="email" name="" id="" />',
			'input:url': '<input type="url" name="" id="" />',
			'input:password': '<input type="password" name="" id="" />',
			'input:p': '<input type="password" name="" id="" />',
			'input:datetime': '<input type="datetime" name="" id="" />',
			'input:date': '<input type="date" name="" id="" />',
			'input:datetime-local': '<input type="datetime-local" name="" id="" />',
			'input:month': '<input type="month" name="" id="" />',
			'input:week': '<input type="week" name="" id="" />',
			'input:time': '<input type="time" name="" id="" />',
			'input:number': '<input type="number" name="" id="" />',
			'input:color': '<input type="color" name="" id="" />',
			'input:checkbox': '<input type="checkbox" name="" id="" />',
			'input:c': '<input type="checkbox" name="" id="" />',
			'input:radio': '<input type="radio" name="" id="" />',
			'input:r': '<input type="radio" name="" id="" />',
			'input:range': '<input type="range" name="" id="" />',
			'input:file': '<input type="file" name="" id="" />',
			'input:f': '<input type="file" name="" id="" />',
			'input:submit': '<input type="submit" value="" />',
			'input:s': '<input type="submit" value="" />',
			'input:image': '<input type="image" src="" alt="" />',
			'input:i': '<input type="image" src="" alt="" />',
			'input:reset': '<input type="reset" value="" />',
			'input:button': '<input type="button" value="" />',
			'input:b': '<input type="button" value="" />',
			'select': '<select name="" id=""></select>',
			'option': '<option value=""></option>',
			'textarea': '<textarea name="" id="" cols="30" rows="10"></textarea>',
			'menu:context': '<menu type="context"></menu>',
			'menu:c': '<menu type="context"></menu>',
			'menu:toolbar': '<menu type="toolbar"></menu>',
			'menu:t': '<menu type="toolbar"></menu>',
			'video': '<video src=""></video>',
			'audio': '<audio src=""></audio>',
			'html:xml': '<html xmlns="http://www.w3.org/1999/xhtml"></html>',
			'bq': '<blockquote></blockquote>',
			'acr': '<acronym></acronym>',
			'fig': '<figure></figure>',
			'ifr': '<iframe></iframe>',
			'emb': '<embed></embed>',
			'obj': '<object></object>',
			'src': '<source></source>',
			'cap': '<caption></caption>',
			'colg': '<colgroup></colgroup>',
			'fst': '<fieldset></fieldset>',
			'btn': '<button></button>',
			'optg': '<optgroup></optgroup>',
			'opt': '<option></option>',
			'tarea': '<textarea></textarea>',
			'leg': '<legend></legend>',
			'sect': '<section></section>',
			'art': '<article></article>',
			'hdr': '<header></header>',
			'ftr': '<footer></footer>',
			'adr': '<address></address>',
			'dlg': '<dialog></dialog>',
			'str': '<strong></strong>',
			'prog': '<progress></progress>',
			'fset': '<fieldset></fieldset>',
			'datag': '<datagrid></datagrid>',
			'datal': '<datalist></datalist>',
			'kg': '<keygen></keygen>',
			'out': '<output></output>',
			'det': '<details></details>',
			'cmd': '<command></command>',
			
			// expandos
			'ol+': 'ol>li',
			'ul+': 'ul>li',
			'dl+': 'dl>dt+dd',
			'map+': 'map>area',
			'table+': 'table>tr>td',
			'colgroup+': 'colgroup>col',
			'colg+': 'colgroup>col',
			'tr+': 'tr>td',
			'select+': 'select>option',
			'optgroup+': 'optgroup>option',
			'optg+': 'optgroup>option'

		},
		
		'element_types': {
			'empty': 'area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed,keygen,command',
			'block_level': 'address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,link,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul,h1,h2,h3,h4,h5,h6',
			'inline_level': 'a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var'
		}
	},
	
	'xsl': {
		'extends': 'html',
		'filters': 'html, xsl',
		'abbreviations': {
			'tm': '<xsl:template match="" mode=""></xsl:template>',
			'tmatch': 'tm',
			'tn': '<xsl:template name=""></xsl:template>',
			'tname': 'tn',
			'xsl:when': '<xsl:when test=""></xsl:when>',
			'wh': 'xsl:when',
			'var': '<xsl:variable name="">|</xsl:variable>',
			'vare': '<xsl:variable name="" select=""/>',
			'if': '<xsl:if test=""></xsl:if>',
			'call': '<xsl:call-template name=""/>',
			'attr': '<xsl:attribute name=""></xsl:attribute>',
			'wp': '<xsl:with-param name="" select=""/>',
			'par': '<xsl:param name="" select=""/>',
			'val': '<xsl:value-of select=""/>',
			'co': '<xsl:copy-of select=""/>',
			'each': '<xsl:for-each select=""></xsl:for-each>',
			'for': 'each',
			'ap': '<xsl:apply-templates select="" mode=""/>',
			'te': '<xsl:text></xsl:text>',
			//expandos
			'choose+': 'xsl:choose>xsl:when+xsl:otherwise'
		}
	},
	
	'haml': {
		'filters': 'haml',
		'extends': 'html'
	}
};/**
 * Core library that do all Zen Coding magic
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * @include "settings.js"
 * @include "/EclipseMonkey/scripts/monkey-doc.js"
 */
var zen_coding = (function(){
	
	var re_tag = /<\/?[\w:\-]+(?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*\s*(\/?)>$/;
	
	var TYPE_ABBREVIATION = 'zen-tag',
		TYPE_EXPANDO = 'zen-expando',
	
		/** Reference to another abbreviation or tag */
		TYPE_REFERENCE = 'zen-reference',
		
		caret_placeholder = '{%::zen-caret::%}',
		newline = '\n',
		default_tag = 'div';
		
	var default_profile = {
		tag_case: 'lower',
		attr_case: 'lower',
		attr_quotes: 'double',
		
		// each tag on new line
		tag_nl: 'decide',
		
		place_cursor: true,
		
		// indent tags
		indent: true,
		
		// how many inline elements should be to force line break 
		// (set to 0 to disable)
		inline_break: 3,
		
		// use self-closing style for writing empty elements, e.g. <br /> or <br>
		self_closing_tag: 'xhtml'
	};
	
	var profiles = {};
	
	/** List of registered filters */
	var filters = {},
		/** Filters that will be applied for unknown syntax */
		basic_filters = 'html';
	
	/**
	 * Проверяет, является ли символ допустимым в аббревиатуре

	 * @param {String} ch
	 * @return {Boolean}
	 */
	function isAllowedChar(ch) {
		var char_code = ch.charCodeAt(0),
			special_chars = '#.>+*:$-_!@[]()|';
		
		return (char_code > 64 && char_code < 91)       // uppercase letter
				|| (char_code > 96 && char_code < 123)  // lowercase letter
				|| (char_code > 47 && char_code < 58)   // number
				|| special_chars.indexOf(ch) != -1;     // special character
	}
	
	/**
	 * Возвращает символ перевода строки, используемый в редакторе

	 * @return {String}
	 */
	function getNewline() {
		return zen_coding.getNewline();
	}
	
	/**
	 * Split text into lines. Set <code>remove_empty</code> to true to filter
	 * empty lines
	 * @param {String} text
	 * @param {Boolean} [remove_empty]
	 * @return {Array}
	 */
	function splitByLines(text, remove_empty) {
		// IE fails to split string by regexp, 
		// need to normalize newlines first
		// Also, Mozilla's Rhiho JS engine has a wierd newline bug
		var nl = getNewline();
		var lines = (text || '')
			.replace(/\r\n/g, '\n')
			.replace(/\n\r/g, '\n')
			.replace(/\n/g, nl)
			.split(nl);
		
		if (remove_empty) {
			for (var i = lines.length; i >= 0; i--) {
				if (!trim(lines[i]))
					lines.splice(i, 1);
			}
		}
		
		return lines;
	}
	
	/**
	 * Trim whitespace from string
	 * @param {String} text
	 * @return {String}
	 */
	function trim(text) {
		return (text || "").replace( /^\s+|\s+$/g, "" );
	}
	
	function createProfile(options) {
		var result = {};
		for (var p in default_profile)
			result[p] = (p in options) ? options[p] : default_profile[p];
		
		return result;
	}
	
	function setupProfile(name, options) {
		profiles[name.toLowerCase()] = createProfile(options || {});
	}
	
	/**
	 * Helper function that transforms string into hash
	 * @return {Object}
	 */
	function stringToHash(str){
		var obj = {}, items = str.split(",");
		for ( var i = 0; i < items.length; i++ )
			obj[ items[i] ] = true;
		return obj;
	}
	
	/**
	 * Repeats string <code>how_many</code> times
	 * @param {String} str
	 * @param {Number} how_many
	 * @return {String}
	 */
	function repeatString(str, how_many) {
		var result = '';
		for (var i = 0; i < how_many; i++) 
			result += str;
			
		return result;
	}
	
	/**
	 * Indents text with padding
	 * @param {String} text Text to indent
	 * @param {String|Number} pad Padding size (number) or padding itself (string)
	 * @return {String}
	 */
	function padString(text, pad) {
		var pad_str = (typeof(pad) == 'number') 
				? repeatString(getIndentation(), pad) 
				: pad, 
			result = '';
		
		var lines = splitByLines(text),
			nl = getNewline();
			
		result += lines[0];
		for (var j = 1; j < lines.length; j++) 
			result += nl + pad_str + lines[j];
			
		return result;
	}
	
	/**
	 * Class inheritance method
	 * @param {Function} derived Derived class
	 * @param {Function} from Base class
	 */
	function inherit(derived, from) {
		var Inheritance = function(){};
	
		Inheritance.prototype = from.prototype;
	
		derived.prototype = new Inheritance();
		derived.prototype.constructor = derived;
		derived.baseConstructor = from;
		derived.superClass = from.prototype;
	};
	
	/**
	 * Check if passed abbreviation is snippet
	 * @param {String} abbr
	 * @param {String} type
	 * @return {Boolean}
	 */
	function isShippet(abbr, type) {
		return getSnippet(type, abbr) ? true : false;
	}
	
	/**
	 * Test if passed string ends with XHTML tag. This method is used for testing
	 * '>' character: it belongs to tag or it's a part of abbreviation? 
	 * @param {String} str
	 * @return {Boolean}
	 */
	function isEndsWithTag(str) {
		return re_tag.test(str);
	}
	
	/**
	 * Returns specified elements collection (like 'empty', 'block_level') from
	 * <code>resource</code>. If collections wasn't found, returns empty object
	 * @param {Object} resource
	 * @param {String} type
	 * @return {Object}
	 */
	function getElementsCollection(resource, type) {
		if (resource && resource.element_types)
			return resource.element_types[type] || {}
		else
			return {};
	}
	
	/**
	 * Replace variables like ${var} in string
	 * @param {String} str
	 * @param {Object} [vars] Variable set (default is <code>zen_settings.variables</code>) 
	 * @return {String}
	 */
	function replaceVariables(str, vars) {
		vars = vars || zen_settings.variables;
		return str.replace(/\$\{([\w\-]+)\}/g, function(str, p1){
			return (p1 in vars) ? vars[p1] : str;
		});
	}
	
	/**
	 * Tag
	 * @class
	 * @param {String} name tag name
	 * @param {Number} count Output multiplier (default: 1)
	 * @param {String} type Tag type (html, xml)
	 */
	function Tag(name, count, type) {
		name = name.toLowerCase();
		type = type || 'html';
		
		var abbr = getAbbreviation(type, name);
		if (abbr && abbr.type == TYPE_REFERENCE)
			abbr = getAbbreviation(type, abbr.value);
		
		this.name = (abbr) ? abbr.value.name : name.replace('+', '');
		this.count = count || 1;
		this.children = [];
		this.attributes = [];
		this._attr_hash = {};
		this._abbr = abbr;
		this._res = zen_settings[type];
		this._content = '';
		this.repeat_by_lines = false;
		this.parent = null;
		
		// add default attributes
		if (this._abbr && this._abbr.value.attributes) {
			var def_attrs = this._abbr.value.attributes;
			if (def_attrs) {
				for (var i = 0; i < def_attrs.length; i++) {
					var attr = def_attrs[i];
					this.addAttribute(attr.name, attr.value);
				}
			}
		}
	}
	
	Tag.prototype = {
		/**
		 * Adds new child tag to current one
		 * @param {Tag} tag
		 */
		addChild: function(tag) {
			tag.parent = this;
			this.children.push(tag);
		},
		
		/**
		 * Adds new attribute
		 * @param {String} name Attribute's name
		 * @param {String} value Attribute's value
		 */
		addAttribute: function(name, value) {
			// the only place in Tag where pipe (caret) character may exist
			// is the attribute: escape it with internal placeholder
			value = replaceUnescapedSymbol(value, '|', caret_placeholder);
			
			var a;
			if (name in this._attr_hash) {
				// attribute already exists, decide what to do
				a = this._attr_hash[name];
				if (name == 'class') {
					// 'class' is a magic attribute
					a.value += ((a.value) ? ' ' : '') + value;
				} else {
					a.value = value;
				}
			} else {
				a = {name: name, value: value};
				this._attr_hash[name] = a
				this.attributes.push(a);
			}
		},
		
		/**
		 * This function tests if current tags' content contains xHTML tags. 
		 * This function is mostly used for output formatting
		 */
		hasTagsInContent: function() {
			var content = this.getContent();
			return content && re_tag.test(content);
		},
		
		/**
		 * Set textual content for tag
		 * @param {String} str Tag's content
		 */
		setContent: function(str) {
			this._content = str;
		},
		
		/**
		 * Returns tag's textual content
		 * @return {String}
		 */
		getContent: function() {
			return this._content;
		},
		
		/**
		 * Search for deepest and latest child of current element
		 * @return {Tag|null} Returns null if there's no children
		 */
		findDeepestChild: function() {
			if (!this.children.length)
				return null;
				
			var deepest_child = this;
			while (true) {
				deepest_child = deepest_child.children[ deepest_child.children.length - 1 ];
				if (!deepest_child.children.length)
					break;
			}
			
			return deepest_child;
		}
	};
	
	function Snippet(name, count, type) {
		/** @type {String} */
		this.name = name;
		this.count = count || 1;
		this.children = [];
		this._content = '';
		this.repeat_by_lines = false;
		this.attributes = {'id': caret_placeholder, 'class': caret_placeholder};
		this.value = replaceUnescapedSymbol(getSnippet(type, name), '|', caret_placeholder);
		this.parent = null;
	}
	
	inherit(Snippet, Tag);
	
	/**
	 * Returns abbreviation value from data set
	 * @param {String} type Resource type (html, css, ...)
	 * @param {String} abbr Abbreviation name
	 * @return {Object|null}
	 */
	function getAbbreviation(type, abbr) {
		return getSettingsResource(type, abbr, 'abbreviations');
	}
	
	/**
	 * Returns snippet value from data set
	 * @param {String} type Resource type (html, css, ...)
	 * @param {String} snippet_name Snippet name
	 * @return {Object|null}
	 */
	function getSnippet(type, snippet_name) {
		return getSettingsResource(type, snippet_name, 'snippets');
	}
	
	/**
	 * Returns variable value
	 * @return {String}
	 */
	function getVariable(name) {
		return zen_settings.variables[name];
	}
	
	/**
	 * Returns indentation string
	 * @return {String}
	 */
	function getIndentation() {
		return getVariable('indentation');
	}
	
	/**
	 * Creates resource inheritance chain for lookups
	 * @param {String} syntax Syntax name
	 * @param {String} name Resource name
	 * @return {Array}
	 */
	function createResourceChain(syntax, name) {
		var resource = zen_settings[syntax],
			result = [];
		
		if (resource) {
			if (name in resource)
				result.push(resource[name]);
			if ('extends' in resource) {
				// find resource in ancestors
				for (var i = 0; i < resource['extends'].length; i++) {
					var type = resource['extends'][i];
					if (zen_settings[type] && zen_settings[type][name])
						result.push(zen_settings[type][name]);
				}
			}
		}
		
		return result;
	}
	
	/**
	 * Get resource collection from settings file for specified syntax. 
	 * It follows inheritance chain if resource wasn't directly found in
	 * syntax settings
	 * @param {String} syntax Syntax name
	 * @param {String} name Resource name
	 */
	function getResource(syntax, name) {
		var chain = createResourceChain(syntax, name);
		return chain[0];
	}
	
	/**
	 * Returns resurce value from data set with respect of inheritance
	 * @param {String} syntax Resource syntax (html, css, ...)
	 * @param {String} abbr Abbreviation name
	 * @param {String} name Resource name ('snippets' or 'abbreviation')
	 * @return {Object|null}
	 */
	function getSettingsResource(syntax, abbr, name) {
		var chain = createResourceChain(syntax, name);
		for (var i = 0, il = chain.length; i < il; i++) {
			if (abbr in chain[i])
				return chain[i][abbr];
		}
		
		return null;
	}
	
	/**
	 * Get word, starting at <code>ix</code> character of <code>str</code>
	 */
	function getWord(ix, str) {
		var m = str.substring(ix).match(/^[\w\-:\$]+/);
		return m ? m[0] : '';
	}
	
	/**
	 * Extract attributes and their values from attribute set 
	 * @param {String} attr_set
	 */
	function extractAttributes(attr_set) {
		attr_set = trim(attr_set);
		var loop_count = 100, // endless loop protection
			re_string = /^(["'])((?:(?!\1)[^\\]|\\.)*)\1/,
			result = [],
			attr;
			
		while (attr_set && loop_count--) {
			var attr_name = getWord(0, attr_set);
			attr = null;
			if (attr_name) {
				attr = {name: attr_name, value: ''};
//				result[attr_name] = '';
				// let's see if attribute has value
				var ch = attr_set.charAt(attr_name.length);
				switch (ch) {
					case '=':
						var ch2 = attr_set.charAt(attr_name.length + 1);
						if (ch2 == '"' || ch2 == "'") {
							// we have a quoted string
							var m = attr_set.substring(attr_name.length + 1).match(re_string);
							if (m) {
								attr.value = m[2];
								attr_set = trim(attr_set.substring(attr_name.length + m[0].length + 1));
							} else {
								// something wrong, break loop
								attr_set = '';
							}
						} else {
							// unquoted string
							var m = attr_set.substring(attr_name.length + 1).match(/(.+?)(\s|$)/);
							if (m) {
								attr.value = m[1];
								attr_set = trim(attr_set.substring(attr_name.length + m[1].length + 1));
							} else {
								// something wrong, break loop
								attr_set = '';
							}
						}
						break;
					default:
						attr_set = trim(attr_set.substring(attr_name.length));
						break;
				}
			} else {
				// something wrong, can't extract attribute name
				break;
			}
			
			if (attr) result.push(attr);
		}
		return result;
	}
	
	/**
	 * Parses tag attributes extracted from abbreviation
	 * @param {String} str
	 */
	function parseAttributes(str) {
		/*
		 * Example of incoming data:
		 * #header
		 * .some.data
		 * .some.data#header
		 * [attr]
		 * #item[attr=Hello other="World"].class
		 */
		var result = [],
			class_name,
			char_map = {'#': 'id', '.': 'class'};
		
		// walk char-by-char
		var i = 0,
			il = str.length,
			val;
			
		while (i < il) {
			var ch = str.charAt(i);
			switch (ch) {
				case '#': // id
					val = getWord(i, str.substring(1));
					result.push({name: char_map[ch], value: val});
					i += val.length + 1;
					break;
				case '.': // class
					val = getWord(i, str.substring(1));
					if (!class_name) {
						// remember object pointer for value modification
						class_name = {name: char_map[ch], value: ''};
						result.push(class_name);
					}
					
					class_name.value += ((class_name.value) ? ' ' : '') + val;
					i += val.length + 1;
					break;
				case '[': //begin attribute set
					// search for end of set
					var end_ix = str.indexOf(']', i);
					if (end_ix == -1) {
						// invalid attribute set, stop searching
						i = str.length;
					} else {
						var attrs = extractAttributes(str.substring(i + 1, end_ix));
						for (var j = 0, jl = attrs.length; j < jl; j++) {
							result.push(attrs[j]);
						}
						i = end_ix;
					}
					break;
				default:
					i++;
				
			}
		}
		
		return result;
	}
	
	/**
	 * Creates group element
	 * @param {String} expr Part of abbreviation that belongs to group item
	 * @param {abbrGroup} [parent] Parent group item element
	 */
	function abbrGroup(parent) {
		return {
			expr: '',
			parent: parent || null,
			children: [],
			addChild: function() {
				var child = abbrGroup(this);
				this.children.push(child);
				return child;
			},
			cleanUp: function() {
				for (var i = this.children.length - 1; i >= 0; i--) {
					var expr = this.children[i].expr;
					if (!expr)
						this.children.splice(i, 1);
					else {
						// remove operators at the and of expression
//						this.children[i].expr = expr.replace(/[\+>]+$/, '');
						this.children[i].cleanUp();
					}
				}
			}
		}
	}
	
	/**
	 * Split abbreviation by groups
	 * @param {String} abbr
	 * @return {abbrGroup()}
	 */
	function splitByGroups(abbr) {
		var root = abbrGroup(),
			last_parent = root,
			cur_item = root.addChild(),
			stack = [],
			i = 0,
			il = abbr.length;
		
		while (i < il) {
			var ch = abbr.charAt(i);
			switch(ch) {
				case '(':
					// found new group
					var operator = i ? abbr.charAt(i - 1) : '';
					if (operator == '>') {
						stack.push(cur_item);
						last_parent = cur_item;
					} else {
						stack.push(last_parent);
					}
					cur_item = null;
					break;
				case ')':
					last_parent = stack.pop();
					cur_item = null;
					var next_char = (i < il - 1) ? abbr.charAt(i + 1) : '';
					if (next_char == '+' || next_char == '>') 
						// next char is group operator, skip it
						i++;
					break;
				default:
					if (ch == '+' || ch == '>') {
						// skip operator if it's followed by parenthesis
						var next_char = (i + 1 < il) ? abbr.charAt(i + 1) : '';
						if (next_char == '(') break;
					}
					if (!cur_item)
						cur_item = last_parent.addChild();
					cur_item.expr += ch;
			}
			
			i++;
		}
		
		root.cleanUp();
		return root;
	}
	
	/**
	 * @class
	 * Creates simplified tag from Zen Coding tag
	 * @param {Tag} tag
	 */
	function ZenNode(tag) {
		
		this.type = (tag instanceof Snippet) ? 'snippet' : 'tag';
		this.name = tag.name;
		this.attributes = tag.attributes;
		this.children = [];
		this.counter = 1;
		
		/** @type {Tag} Source element from which current tag was created */
		this.source = tag;
		
		// relations
		/** @type {ZenNode} */
		this.parent = null;
		/** @type {ZenNode} */
		this.nextSibling = null;
		/** @type {ZenNode} */
		this.previousSibling = null;
		
		// output params
		this.start = '';
		this.end = '';
		this.content = '';
		this.padding = '';
	}
	
	ZenNode.prototype = {
		/**
		 * @type {ZenNode} tag
		 */
		addChild: function(tag) {
			tag.parent = this;
			var last_child = this.children[this.children.length - 1];
			if (last_child) {
				tag.previousSibling = last_child;
				last_child.nextSibling = tag;
			}
			
			this.children.push(tag);
		},
		
		/**
		 * Get attribute's value.
		 * @param {String} name
		 * @return {String|null} Returns <code>null</code> if attribute wasn't found
		 */
		getAttribute: function(name) {
			name = name.toLowerCase();
			for (var i = 0, il = this.attributes.length; i < il; i++) {
				if (this.attributes[i].name.toLowerCase() == name)
					return this.attributes[i].value;
			}
			
			return null;
		},
		
		/**
		 * Test if current tag is unary (no closing tag)
		 * @return {Boolean}
		 */
		isUnary: function() {
			if (this.type == 'snippet')
				return false;
				
			return (this.source._abbr && this.source._abbr.value.is_empty) || (this.name in getElementsCollection(this.source._res, 'empty'));
		},
		
		/**
		 * Test if current tag is inline-level (like &lt;strong&gt;, &lt;img&gt;)
		 * @return {Boolean}
		 */
		isInline: function() {
			return (this.name in getElementsCollection(this.source._res, 'inline_level'));
		},
		
		/**
		 * Test if current element is block-level
		 * @return {Boolean}
		 */
		isBlock: function() {
			return this.type == 'snippet' || !this.isInline();
		},
		
		/**
		 * This function tests if current tags' content contains xHTML tags. 
		 * This function is mostly used for output formatting
		 */
		hasTagsInContent: function() {
			return this.content && re_tag.test(this.content);
		},
		
		/**
		 * Check if tag has child elements
		 * @return {Boolean}
		 */
		hasChildren: function() {
			return !!this.children.length;
		},
		
		/**
		 * Test if current tag contains block-level children
		 * @return {Boolean}
		 */
		hasBlockChildren: function() {
			if (this.hasTagsInContent() && this.isBlock()) {
				return true;
			}
			
			for (var i = 0; i < this.children.length; i++) {
				if (this.children[i].isBlock())
					return true;
			}
			
			return false;
		},
		
		/**
		 * Search for deepest and latest child of current element
		 * @return {ZenNode|null} Returns <code>null</code> if there's no children
		 */
		findDeepestChild: function() {
			if (!this.children.length)
				return null;
				
			var deepest_child = this;
			while (true) {
				deepest_child = deepest_child.children[ deepest_child.children.length - 1 ];
				if (!deepest_child.children.length)
					break;
			}
			
			return deepest_child;
		},
		
		/**
		 * @return {String}
		 */
		toString: function() {
			var content = '';
			for (var i = 0, il = this.children.length; i < il; i++) {
				content += this.children[i].toString();
			}
			
			return this.start + this.content + content + this.end;
		}
	}
	
	/**
	 * Roll outs basic Zen Coding tree into simplified, DOM-like tree.
	 * The simplified tree, for example, represents each multiplied element 
	 * as a separate element sets with its own content, if exists.
	 * 
	 * The simplified tree element contains some meta info (tag name, attributes, 
	 * etc.) as well as output strings, which are exactly what will be outputted
	 * after expanding abbreviation. This tree is used for <i>filtering</i>:
	 * you can apply filters that will alter output strings to get desired look
	 * of expanded abbreviation.
	 * 
	 * @param {Tag} tree
	 * @param {ZenNode} [parent]
	 */
	function rolloutTree(tree, parent) {
		parent = parent || new ZenNode(tree);
		var how_many = 1,
			tag_content = '';
		
		for (var i = 0, il = tree.children.length; i < il; i++) {
			/** @type {Tag} */
			var child = tree.children[i];
			how_many = child.count;
			
			if (child.repeat_by_lines) {
				// it's a repeating element
				tag_content = splitByLines(child.getContent(), true);
				how_many = Math.max(tag_content.length, 1);
			} else {
				tag_content = child.getContent();
			}
			
			for (var j = 0; j < how_many; j++) {
				var tag = new ZenNode(child);
				parent.addChild(tag);
				tag.counter = j + 1;
				
				if (child.children.length)
					rolloutTree(child, tag);
					
				var add_point = tag.findDeepestChild() || tag;
				if (tag_content) {
					add_point.content = (typeof(tag_content) == 'string') 
						? tag_content 
						: (tag_content[j] || '');
				}
			}
		}
		
		return parent;
	}
	
	/**
	 * Runs filters on tree
	 * @param {ZenNode} tree
	 * @param {String|Object} profile
	 * @param {String[]|String} filter_list
	 * @return {ZenNode}
	 */
	function runFilters(tree, profile, filter_list) {
		if (typeof(profile) == 'string' && profile in profiles)
			profile = profiles[profile];
		
		if (!profile)
			profile = profiles['plain'];
			
		if (typeof(filter_list) == 'string')
			filter_list = filter_list.split(/[\|,]/g);
			
		for (var i = 0, il = filter_list.length; i < il; i++) {
			var name = trim(filter_list[i].toLowerCase());
			if (name && name in filters) {
				tree = filters[name](tree, profile);
			}
		}
		
		return tree;
	}
	
	/**
	 * Transforms abbreviation into a primary internal tree. This tree should'n 
	 * be used ouside of this scope
	 * @param {String} abbr Abbreviation
	 * @param {String} [type] Document type (xsl, html, etc.)
	 * @return {Tag}
	 */
	function abbrToPrimaryTree(abbr, type) {
		type = type || 'html';
		var root = new Tag('', 1, type),
			parent = root,
			last = null,
			multiply_elem = null,
			res = zen_settings[type],
			re = /([\+>])?([a-z@\!\#\.][\w:\-]*)((?:(?:[#\.][\w\-\$]+)|(?:\[[^\]]+\]))+)?(\*(\d*))?(\+$)?/ig;
//				re = /([\+>])?([a-z@\!][a-z0-9:\-]*)(#[\w\-\$]+)?((?:\.[\w\-\$]+)*)(\*(\d*))?(\+$)?/ig;
		
		if (!abbr)
			return null;
		
		// replace expandos
		abbr = abbr.replace(/([a-z][\w\:\-]*)\+$/i, function(str){
			var a = getAbbreviation(type, str);
			return a ? a.value : str;
		});
		
		abbr = abbr.replace(re, function(str, operator, tag_name, attrs, has_multiplier, multiplier, has_expando){
			var multiply_by_lines = (has_multiplier && !multiplier);
			multiplier = multiplier ? parseInt(multiplier) : 1;
			
			var tag_ch = tag_name.charAt(0);
			if (tag_ch == '#' || tag_ch == '.') {
				attrs = tag_name + (attrs || '');
				tag_name = default_tag;
			}
			
			if (has_expando)
				tag_name += '+';
				
			var current = isShippet(tag_name, type) ? new Snippet(tag_name, multiplier, type) : new Tag(tag_name, multiplier, type);
			if (attrs) {
				attrs = parseAttributes(attrs);
				for (var i = 0, il = attrs.length; i < il; i++) {
					current.addAttribute(attrs[i].name, attrs[i].value);
				}
			}
			
			// dive into tree
			if (operator == '>' && last)
				parent = last;
				
			parent.addChild(current);
			
			last = current;
			
			if (multiply_by_lines)
				multiply_elem = current;
			
			return '';
		});
		
		root.last = last;
		root.multiply_elem = multiply_elem;
		
		// empty 'abbr' string means that abbreviation was successfully expanded,
		// if not — abbreviation wasn't valid 
		return (!abbr) ? root : null;	
	}
	
	/**
	 * Expand single group item 
	 * @param {abbrGroup} group
	 * @param {String} type
	 * @param {Tag} parent
	 */
	function expandGroup(group, type, parent) {
		var tree = abbrToPrimaryTree(group.expr, type),
			/** @type {Tag} */
			last_item = null;
			
		if (tree) {
			for (var i = 0, il = tree.children.length; i < il; i++) {
				last_item = tree.children[i];
				parent.addChild(last_item);
			}
		} else {
			throw new Error('InvalidGroup');
		}
		
		// set repeating element to the topmost node
		var root = parent;
		while (root.parent)
			root = root.parent;
		
		root.last = tree.last;
		if (tree.multiply_elem)
			root.multiply_elem = tree.multiply_elem;
			
		// process child groups
		if (group.children.length) {
			var add_point = last_item.findDeepestChild() || last_item;
			for (var j = 0, jl = group.children.length; j < jl; j++) {
				expandGroup(group.children[j], type, add_point);
			}
		}
	}
	
	/**
	 * Pad string with zeroes
	 * @param {String} str
	 * @param {Number} pad
	 */
	function zeroPadString(str, pad) {
		var padding = '', 
			il = str.length;
			
		while (pad > il++) padding += '0';
		return padding + str; 
	}
	
	/**
	 * Replaces unescaped symbols in <code>str</code>. For example, the '$' symbol
	 * will be replaced in 'item$count', but not in 'item\$count'.
	 * @param {String} str Original string
	 * @param {String} symbol Symbol to replace
	 * @param {String|Function} replace Symbol replacement
	 * @return {String}
	 */
	function replaceUnescapedSymbol(str, symbol, replace) {
		var i = 0,
			il = str.length,
			sl = symbol.length,
			match_count = 0;
			
		while (i < il) {
			if (str.charAt(i) == '\\') {
				// escaped symbol, skip next character
				i += sl + 1;
			} else if (str.substr(i, sl) == symbol) {
				// have match
				var cur_sl = sl;
				match_count++;
				var new_value = replace;
				if (typeof(replace) !== 'string') {
					var replace_data = replace(str, symbol, i, match_count);
					if (replace_data) {
						cur_sl = replace_data[0].length;
						new_value = replace_data[1];
					} else {
						new_value = false;
					}
				}
				
				if (new_value === false) { // skip replacement
					i++;
					continue;
				}
				
				str = str.substring(0, i) + new_value + str.substring(i + cur_sl);
				// adjust indexes
				il = str.length;
				i += new_value.length;
			} else {
				i++;
			}
		}
		
		return str;
	}
	
	// create default profiles
	setupProfile('xhtml');
	setupProfile('html', {self_closing_tag: false});
	setupProfile('xml', {self_closing_tag: true, tag_nl: true});
	setupProfile('plain', {tag_nl: false, indent: false, place_cursor: false});
	
	
	return {
		/** Hash of all available actions */
		actions: {},
		
		/**
		 * Adds new Zen Coding action. This action will be available in
		 * <code>zen_settings.actions</code> object.
		 * @param {String} name Action's name
		 * @param {Function} fn Action itself. The first argument should be
		 * <code>zen_editor</code> instance.
		 */
		registerAction: function(name, fn) {
			this.actions[name] = fn;
		},
		
		/**
		 * Runs Zen Coding action. For list of available actions and their
		 * arguments see <code>zen_actions.js</code> file.
		 * @param {String} name Action name 
		 * @param {Array} args Additional arguments. It may be array of arguments
		 * or inline arguments. The first argument should be <code>zen_editor</code> instance
		 * @example
		 * zen_coding.runActions('expand_abbreviation', zen_editor);  
		 * zen_coding.runActions('wrap_with_abbreviation', [zen_editor, 'div']);  
		 */
		runAction: function(name, args) {
			if (!(args instanceof Array))
				args = Array.prototype.slice.call(arguments, 1);
				
			try {
				if (name in this.actions)
					return this.actions[name].apply(this, args);
			} catch(e){
				return false; 
			}
		},
		
		expandAbbreviation: function(abbr, type, profile) {
			type = type || 'html';
			var tree_root = this.parseIntoTree(abbr, type);
			
			if (tree_root) {
				var tree = rolloutTree(tree_root);
				this.applyFilters(tree, type, profile, tree_root.filters);
				return replaceVariables(tree.toString());
			}
			
			return '';
		},
		
		/**
		 * Extracts abbreviations from text stream, starting from the end
		 * @param {String} str
		 * @return {String} Abbreviation or empty string
		 */
		extractAbbreviation: function(str) {
			var cur_offset = str.length,
				start_index = -1,
				brace_count = 0;
			
			while (true) {
				cur_offset--;
				if (cur_offset < 0) {
					// moved to the beginning of the line
					start_index = 0;
					break;
				}
				
				var ch = str.charAt(cur_offset);
				
				if (ch == ']')
					brace_count++;
				else if (ch == '[')
					brace_count--;
				else {
					if (brace_count) 
						// respect all characters inside attribute sets
						continue;
					else if (!isAllowedChar(ch) || (ch == '>' && isEndsWithTag(str.substring(0, cur_offset + 1)))) {
						// found stop symbol
						start_index = cur_offset + 1;
						break;
					}
				}
			}
			
			if (start_index != -1) 
				// found somethind, return abbreviation
				return str.substring(start_index);
			else
				return '';
		},
		
		/**
		 * Parses abbreviation into a node set
		 * @param {String} abbr Abbreviation
		 * @param {String} type Document type (xsl, html, etc.)
		 * @return {Tag}
		 */
		parseIntoTree: function(abbr, type) {
			type = type || 'html';
			// remove filters from abbreviation
			var filter_list = '';
			abbr = abbr.replace(/\|([\w\|\-]+)$/, function(str, p1){
				filter_list = p1;
				return '';
			});
			
			// split abbreviation by groups
			var group_root = splitByGroups(abbr),
				tree_root = new Tag('', 1, type);
			
			// then recursively expand each group item
			try {
				for (var i = 0, il = group_root.children.length; i < il; i++) {
					expandGroup(group_root.children[i], type, tree_root);
				}
			} catch(e) {
				// there's invalid group, stop parsing
				return null;
			}
			
			tree_root.filters = filter_list;
			return tree_root;
		},
		
		/**
		 * Indents text with padding
		 * @param {String} text Text to indent
		 * @param {String|Number} pad Padding size (number) or padding itself (string)
		 * @return {String}
		 */
		padString: padString,
		setupProfile: setupProfile,
		getNewline: function(){
			return newline;
		},
		
		setNewline: function(str) {
			newline = str;
		},
		
		/**
		 * Wraps passed text with abbreviation. Text will be placed inside last
		 * expanded element
		 * @param {String} abbr Abbreviation
		 * @param {String} text Text to wrap
		 * @param {String} [type] Document type (html, xml, etc.). Default is 'html'
		 * @param {String} [profile] Output profile's name. Default is 'plain'
		 * @return {String}
		 */
		wrapWithAbbreviation: function(abbr, text, type, profile) {
			type = type || 'html';
			var tree_root = this.parseIntoTree(abbr, type);
			if (tree_root) {
				var repeat_elem = tree_root.multiply_elem || tree_root.last;
				repeat_elem.setContent(text);
				repeat_elem.repeat_by_lines = !!tree_root.multiply_elem;
				
				var tree = rolloutTree(tree_root);
				this.applyFilters(tree, type, profile, tree_root.filters);
				return replaceVariables(tree.toString());
			}
			
			return null;
		},
		
		splitByLines: splitByLines,
		
		/**
		 * Check if cursor is placed inside xHTML tag
		 * @param {String} html Contents of the document
		 * @param {Number} cursor_pos Current caret position inside tag
		 * @return {Boolean}
		 */
		isInsideTag: function(html, cursor_pos) {
			var re_tag = /^<\/?\w[\w\:\-]*.*?>/;
			
			// search left to find opening brace
			var pos = cursor_pos;
			while (pos > -1) {
				if (html.charAt(pos) == '<') 
					break;
				pos--;
			}
			
			if (pos != -1) {
				var m = re_tag.exec(html.substring(pos));
				if (m && cursor_pos > pos && cursor_pos < pos + m[0].length)
					return true;
			}
			
			return false;
		},
		
		/**
		 * Returns caret placeholder
		 * @return {String}
		 */
		getCaretPlaceholder: function() {
			return (typeof(caret_placeholder) != 'string') 
				? caret_placeholder()
				: caret_placeholder
		},
		
		/**
		 * Set caret placeholder: a string (like '|') or function.
		 * You may use a function as a placeholder generator. For example,
		 * TextMate uses ${0}, ${1}, ..., ${n} natively for quick Tab-switching
		 * between them.
		 * @param {String|Function} value
		 */
		setCaretPlaceholder: function(value) {
			caret_placeholder = value;
		},
		
		rolloutTree: rolloutTree,
		
		/**
		 * Register new filter
		 * @param {String} name Filter name
		 * @param {Function} fn Filter function
		 */
		registerFilter: function(name, fn) {
			filters[name] = fn;
		},
		
		/**
		 * Factory method that produces <code>ZenNode</code> instance
		 * @param {String} name Node name
		 * @param {Array} [attrs] Array of attributes as key/value objects  
		 * @return {ZenNode}
		 */
		nodeFactory: function(name, attrs) {
			return new ZenNode({name: name, attributes: attrs || []});
		},
		
		/**
		 * Applies filters to tree according to syntax
		 * @param {ZenNode} tree Tag tree to apply filters to
		 * @param {String} syntax Syntax name ('html', 'css', etc.)
		 * @param {String|Object} profile Profile or profile's name
		 * @param {String|Array} [additional_filters] List or pipe-separated 
		 * string of additional filters to apply
		 * 
		 * @return {ZenNode}
		 */
		applyFilters: function(tree, syntax, profile, additional_filters){
			var _filters = getResource(syntax, 'filters') || basic_filters;
				
			if (additional_filters)
				_filters += '|' + ((typeof(additional_filters) == 'string') 
					? additional_filters 
					: additional_filters.join('|'));
				
			if (!_filters)
				// looks like unknown syntax, apply basic filters
				_filters = basic_filters;
				
			return runFilters(tree, profile, _filters);
		},
		
		runFilters: runFilters,
		
		repeatString: repeatString,
		getVariable: getVariable,
		setVariable: function(name, value) {
			zen_settings.variables[name] = value;
		},
		replaceVariables: replaceVariables,
		
		/**
		 * Escapes special characters used in Zen Coding, like '$', '|', etc.
		 * Use this method before passing to actions like "Wrap with Abbreviation"
		 * to make sure that existing spacial characters won't be altered
		 * @param {String} text
		 * @return {String}
		 */
		escapeText: function(text) {
			return text.replace(/([\$\|\\])/g, '\\$1');
		},
		
		/**
		 * Unescapes special characters used in Zen Coding, like '$', '|', etc.
		 * @param {String} text
		 * @return {String}
		 */
		unescapeText: function(text) {
			return text.replace(/\\(.)/g, '$1');
		},
		
		/**
		 * Replaces '$' character in string assuming it might be escaped with '\'
		 * @param {String} str
		 * @param {String|Number} value
		 * @return {String}
		 */
		replaceCounter: function(str, value) {
			var symbol = '$';
			value = String(value);
			return replaceUnescapedSymbol(str, symbol, function(str, symbol, pos, match_num){
				if (str.charAt(pos + 1) == '{') {
					// it's a variable, skip it
					return false;
				}
				
				// replace sequense of $ symbols with padded number  
				var j = pos + 1;
				while(str.charAt(j) == '$' && str.charAt(j + 1) != '{') j++;
				return [str.substring(pos, j), zeroPadString(value, j - pos)];
			});
		},
		
		/**
		 * Get profile by it's name. If profile wasn't found, returns 'plain'
		 * profile
		 */
		getProfile: function(name) {
			return (name in profiles) ? profiles[name] : profiles['plain'];
		},
		
		settings_parser: (function(){
			/**
			 * Unified object for parsed data
			 */
			function entry(type, key, value) {
				return {
					type: type,
					key: key,
					value: value
				};
			}
			
			/** Regular expression for XML tag matching */
			var re_tag = /^<(\w+\:?[\w\-]*)((?:\s+[\w\:\-]+\s*=\s*(['"]).*?\3)*)\s*(\/?)>/,
				re_attrs = /([\w\-]+)\s*=\s*(['"])(.*?)\2/g;
			
			/**
			 * Make expando from string
			 * @param {String} key
			 * @param {String} value
			 * @return {Object}
			 */
			function makeExpando(key, value) {
				return entry(TYPE_EXPANDO, key, value);
			}
			
			/**
			 * Make abbreviation from string
			 * @param {String} key Abbreviation key
			 * @param {String} tag_name Expanded element's tag name
			 * @param {String} attrs Expanded element's attributes
			 * @param {Boolean} is_empty Is expanded element empty or not
			 * @return {Object}
			 */
			function makeAbbreviation(key, tag_name, attrs, is_empty) {
				var result = {
					name: tag_name,
					is_empty: Boolean(is_empty)
				};
				
				if (attrs) {
					var m;
					result.attributes = [];
					while (m = re_attrs.exec(attrs)) {
						result.attributes.push({
							name: m[1],
							value: m[3]
						});
					}
				}
				
				return entry(TYPE_ABBREVIATION, key, result);
			}
			
			/**
			 * Parses all abbreviations inside object
			 * @param {Object} obj
			 */
			function parseAbbreviations(obj) {
				for (var key in obj) {
					var value = obj[key], m;
					
					key = trim(key);
					if (key.substr(-1) == '+') {
						// this is expando, leave 'value' as is
						obj[key] = makeExpando(key, value);
					} else if (m = re_tag.exec(value)) {
						obj[key] = makeAbbreviation(key, m[1], m[2], m[4] == '/');
					} else {
						// assume it's reference to another abbreviation
						obj[key] = entry(TYPE_REFERENCE, key, value);
					}
					
				}
			}
			
			return {
				/**
				 * Parse user's settings
				 * @param {Object} settings
				 */
				parse: function(settings) {
					for (var p in settings) {
						if (p == 'abbreviations')
							parseAbbreviations(settings[p]);
						else if (p == 'extends') {
							var ar = settings[p].split(',');
							for (var i = 0; i < ar.length; i++) 
								ar[i] = trim(ar[i]);
							settings[p] = ar;
						}
						else if (typeof(settings[p]) == 'object')
							arguments.callee(settings[p]);
					}
				},
				
				extend: function(parent, child) {
					for (var p in child) {
						if (typeof(child[p]) == 'object' && parent.hasOwnProperty(p))
							arguments.callee(parent[p], child[p]);
						else
							parent[p] = child[p];
					}
				},
				
				/**
				 * Create hash maps on certain string properties
				 * @param {Object} obj
				 */
				createMaps: function(obj) {
					for (var p in obj) {
						if (p == 'element_types') {
							for (var k in obj[p]) 
								obj[p][k] = stringToHash(obj[p][k]);
						} else if (typeof(obj[p]) == 'object') {
							arguments.callee(obj[p]);
						}
					}
				},
				
				TYPE_ABBREVIATION: TYPE_ABBREVIATION,
				TYPE_EXPANDO: TYPE_EXPANDO,
				
				/** Reference to another abbreviation or tag */
				TYPE_REFERENCE: TYPE_REFERENCE
			}
		})()
	}
	
})();

if ('zen_settings' in this || zen_settings) {
	// first we need to expand some strings into hashes
	zen_coding.settings_parser.createMaps(zen_settings);
	if ('my_zen_settings' in this) {
		// we need to extend default settings with user's
		zen_coding.settings_parser.createMaps(my_zen_settings);
		zen_coding.settings_parser.extend(zen_settings, my_zen_settings);
	}
	
	// now we need to parse final set of settings
	zen_coding.settings_parser.parse(zen_settings);
}/**
 * Middleware layer that communicates between editor and Zen Coding.
 * This layer describes all available Zen Coding actions, like 
 * "Expand Abbreviation".
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "zen_editor.js"
 * @include "html_matcher.js"
 * @include "zen_coding.js"
 */

/**
 * Search for abbreviation in editor from current caret position
 * @param {zen_editor} editor Editor instance
 * @return {String|null}
 */
function findAbbreviation(editor) {
	var range = editor.getSelectionRange();
	if (range.start != range.end) {
		// abbreviation is selected by user
		return editor.getContent().substring(range.start, range.end);
	}
	
	// search for new abbreviation from current caret position
	var cur_line = editor.getCurrentLineRange();
	var substr = editor.getContent().substring(cur_line.start, range.start);
	var s = zen_coding.extractAbbreviation(substr); 
	return s;
}

/**
 * Find from current caret position and expand abbreviation in editor
 * @param {zen_editor} editor Editor instance
 * @param {String} [syntax] Syntax type (html, css, etc.)
 * @param {String} [profile_name] Output profile name (html, xml, xhtml)
 * @return {Boolean} Returns <code>true</code> if abbreviation was expanded 
 * successfully
 */
function expandAbbreviation(editor, syntax, profile_name) {
	syntax = syntax || editor.getSyntax();
	profile_name = profile_name || editor.getProfileName();
	
	var caret_pos = editor.getSelectionRange().end,
		abbr,
		content = '';

		
	if ( (abbr = findAbbreviation(editor)) ) {
		content = zen_coding.expandAbbreviation(abbr, syntax, profile_name);
		if (content) {
			editor.replaceContent(content, caret_pos - abbr.length, caret_pos);
			return true;
		}
	}
	
	return false;
}

/**
 * A special version of <code>expandAbbreviation</code> function: if it can't
 * find abbreviation, it will place Tab character at caret position
 * @param {zen_editor} editor Editor instance
 * @param {String} syntax Syntax type (html, css, etc.)
 * @param {String} profile_name Output profile name (html, xml, xhtml)
 */
function expandAbbreviationWithTab(editor, syntax, profile_name) {
	syntax = syntax || editor.getSyntax();
	profile_name = profile_name || editor.getProfileName();
	if (!expandAbbreviation(editor, syntax, profile_name))
		editor.replaceContent(zen_coding.getVariable('indentation'), editor.getCaretPos());
}

/**
 * Find and select HTML tag pair
 * @param {zen_editor} editor Editor instance
 * @param {String} [direction] Direction of pair matching: 'in' or 'out'. 
 * Default is 'out'
 */
function matchPair(editor, direction, syntax) {
	direction = (direction || 'out').toLowerCase();
	syntax = syntax || editor.getProfileName();
	
	var range = editor.getSelectionRange(),
		cursor = range.end,
		range_start = range.start, 
		range_end = range.end,
//		content = zen_coding.splitByLines(editor.getContent()).join('\n'),
		content = editor.getContent(),
		range = null,
		_r,
	
		old_open_tag = zen_coding.html_matcher.last_match['opening_tag'],
		old_close_tag = zen_coding.html_matcher.last_match['closing_tag'];
		
	if (direction == 'in' && old_open_tag && range_start != range_end) {
//		user has previously selected tag and wants to move inward
		if (!old_close_tag) {
//			unary tag was selected, can't move inward
			return false;
		} else if (old_open_tag.start == range_start) {
			if (content.charAt(old_open_tag.end) == '<') {
//				test if the first inward tag matches the entire parent tag's content
				_r = zen_coding.html_matcher.find(content, old_open_tag.end + 1, syntax);
				if (_r[0] == old_open_tag.end && _r[1] == old_close_tag.start) {
					range = zen_coding.html_matcher(content, old_open_tag.end + 1, syntax);
				} else {
					range = [old_open_tag.end, old_close_tag.start];
				}
			} else {
				range = [old_open_tag.end, old_close_tag.start];
			}
		} else {
			var new_cursor = content.substring(0, old_close_tag.start).indexOf('<', old_open_tag.end);
			var search_pos = new_cursor != -1 ? new_cursor + 1 : old_open_tag.end;
			range = zen_coding.html_matcher(content, search_pos, syntax);
		}
	} else {
		range = zen_coding.html_matcher(content, cursor, syntax);
	}
	
	if (range !== null && range[0] != -1) {
		editor.createSelection(range[0], range[1]);
		return true;
	} else {
		return false;
	}
}

/**
 * Narrow down text indexes, adjusting selection to non-space characters
 * @param {String} text
 * @param {Number} start
 * @param {Number} end
 * @return {Array}
 */
function narrowToNonSpace(text, start, end) {
	// narrow down selection until first non-space character
	var re_space = /\s|\n|\r/;
	function isSpace(ch) {
		return re_space.test(ch);
	}
	
	while (start < end) {
		if (!isSpace(text.charAt(start)))
			break;
			
		start++;
	}
	
	while (end > start) {
		end--;
		if (!isSpace(text.charAt(end))) {
			end++;
			break;
		}
	}
	
	return [start, end];
}

/**
 * Wraps content with abbreviation
 * @param {zen_editor} Editor instance
 * @param {String} abbr Abbreviation to wrap with
 * @param {String} [syntax] Syntax type (html, css, etc.)
 * @param {String} [profile_name] Output profile name (html, xml, xhtml)
 */
function wrapWithAbbreviation(editor, abbr, syntax, profile_name) {
	syntax = syntax || editor.getSyntax();
	profile_name = profile_name || editor.getProfileName();
	
	var range = editor.getSelectionRange(),
		start_offset = range.start,
		end_offset = range.end,
		content = editor.getContent();
		
		
	if (!abbr)
		return null; 
	
	if (start_offset == end_offset) {
		// no selection, find tag pair
		range = zen_coding.html_matcher(content, start_offset, profile_name);
		
		if (!range || range[0] == -1) // nothing to wrap
			return null;
		
		var narrowed_sel = narrowToNonSpace(content, range[0], range[1]);
		
		start_offset = narrowed_sel[0];
		end_offset = narrowed_sel[1];
	}
	
	var new_content = content.substring(start_offset, end_offset),
		result = zen_coding.wrapWithAbbreviation(abbr, unindent(editor, new_content), syntax, profile_name);
	
	if (result) {
		editor.setCaretPos(end_offset);
		editor.replaceContent(result, start_offset, end_offset);
	}
}

/**
 * Unindent content, thus preparing text for tag wrapping
 * @param {zen_editor} editor Editor instance
 * @param {String} text
 * @return {String}
 */
function unindent(editor, text) {
	return unindentText(text, getCurrentLinePadding(editor));
}

/**
 * Removes padding at the beginning of each text's line
 * @param {String} text
 * @param {String} pad
 */
function unindentText(text, pad) {
	var lines = zen_coding.splitByLines(text);
	for (var i = 0; i < lines.length; i++) {
		if (lines[i].search(pad) == 0)
			lines[i] = lines[i].substr(pad.length);
	}
	
	return lines.join(zen_coding.getNewline());
}

/**
 * Returns padding of current editor's line
 * @param {zen_editor} Editor instance
 * @return {String}
 */
function getCurrentLinePadding(editor) {
	return getLinePadding(editor.getCurrentLine());
}

/**
 * Returns line padding
 * @param {String} line
 * @return {String}
 */
function getLinePadding(line) {
	return (line.match(/^(\s+)/) || [''])[0];
}

/**
 * Search for new caret insertion point
 * @param {zen_editor} editor Editor instance
 * @param {Number} inc Search increment: -1 — search left, 1 — search right
 * @param {Number} offset Initial offset relative to current caret position
 * @return {Number} Returns -1 if insertion point wasn't found
 */
function findNewEditPoint(editor, inc, offset) {
	inc = inc || 1;
	offset = offset || 0;
	var cur_point = editor.getCaretPos() + offset,
		content = editor.getContent(),
		max_len = content.length,
		next_point = -1,
		re_empty_line = /^\s+$/;
	
	function ch(ix) {
		return content.charAt(ix);
	}
	
	function getLine(ix) {
		var start = ix;
		while (start >= 0) {
			var c = ch(start);
			if (c == '\n' || c == '\r')
				break;
			start--;
		}
		
		return content.substring(start, ix);
	}
		
	while (cur_point < max_len && cur_point > 0) {
		cur_point += inc;
		var cur_char = ch(cur_point),
			next_char = ch(cur_point + 1),
			prev_char = ch(cur_point - 1);
			
		switch (cur_char) {
			case '"':
			case '\'':
				if (next_char == cur_char && prev_char == '=') {
					// empty attribute
					next_point = cur_point + 1;
				}
				break;
			case '>':
				if (next_char == '<') {
					// between tags
					next_point = cur_point + 1;
				}
				break;
			case '\n':
			case '\r':
				// empty line
				if (re_empty_line.test(getLine(cur_point - 1))) {
					next_point = cur_point;
				}
				break;
		}
		
		if (next_point != -1)
			break;
	}
	
	return next_point;
}

/**
 * Move caret to previous edit point
 * @param {zen_editor} editor Editor instance
 */
function prevEditPoint(editor) {
	var cur_pos = editor.getCaretPos(),
		new_point = findNewEditPoint(editor, -1);
		
	if (new_point == cur_pos)
		// we're still in the same point, try searching from the other place
		new_point = findNewEditPoint(editor, -1, -2);
	
	if (new_point != -1) 
		editor.setCaretPos(new_point);
}

/**
 * Move caret to next edit point
 * @param {zen_editor} editor Editor instance
 */
function nextEditPoint(editor) {
	var new_point = findNewEditPoint(editor, 1);
	if (new_point != -1)
		editor.setCaretPos(new_point);
}

/**
 * Inserts newline character with proper indentation
 * @param {zen_editor} editor Editor instance
 * @param {String} mode Syntax mode (only 'html' is implemented)
 */
function insertFormattedNewline(editor, mode) {
	mode = mode || 'html';
	var caret_pos = editor.getCaretPos(),
		nl = zen_coding.getNewline(),
		pad = zen_coding.getVariable('indentation');
		
	switch (mode) {
		case 'html':
			// let's see if we're breaking newly created tag
			var pair = zen_coding.html_matcher.getTags(editor.getContent(), editor.getCaretPos(), editor.getProfileName());
			
			if (pair[0] && pair[1] && pair[0].type == 'tag' && pair[0].end == caret_pos && pair[1].start == caret_pos) {
				editor.replaceContent(nl + pad + zen_coding.getCaretPlaceholder() + nl, caret_pos);
			} else {
				editor.replaceContent(nl, caret_pos);
			}
			break;
		default:
			editor.replaceContent(nl, caret_pos);
	}
}

/**
 * Select line under cursor
 * @param {zen_editor} editor Editor instance
 */
function selectLine(editor) {
	var range = editor.getCurrentLineRange();
	editor.createSelection(range.start, range.end);
}

/**
 * Moves caret to matching opening or closing tag
 * @param {zen_editor} editor
 */
function goToMatchingPair(editor) {
	var content = editor.getContent(),
		caret_pos = editor.getCaretPos();
	
	if (content.charAt(caret_pos) == '<') 
		// looks like caret is outside of tag pair  
		caret_pos++;
		
	var tags = zen_coding.html_matcher.getTags(content, caret_pos, editor.getProfileName());
		
	if (tags && tags[0]) {
		// match found
		var open_tag = tags[0],
			close_tag = tags[1];
			
		if (close_tag) { // exclude unary tags
			if (open_tag.start <= caret_pos && open_tag.end >= caret_pos)
				editor.setCaretPos(close_tag.start);
			else if (close_tag.start <= caret_pos && close_tag.end >= caret_pos)
				editor.setCaretPos(open_tag.start);
		}
	}
}

/**
 * Merge lines spanned by user selection. If there's no selection, tries to find
 * matching tags and use them as selection
 * @param {zen_editor} editor
 */
function mergeLines(editor) {
	var selection = editor.getSelectionRange();
	if (selection.start == selection.end) {
		// find matching tag
		var pair = zen_coding.html_matcher(editor.getContent(), editor.getCaretPos(), editor.getProfileName());
		if (pair) {
			selection.start = pair[0];
			selection.end = pair[1];
		}
	}
	
	if (selection.start != selection.end) {
		// got range, merge lines
		var text = editor.getContent().substring(selection.start, selection.end),
			old_length = text.length;
		var lines =  zen_coding.splitByLines(text);
		
		for (var i = 1; i < lines.length; i++) {
			lines[i] = lines[i].replace(/^\s+/, '');
		}
		
		text = lines.join('').replace(/\s{2,}/, ' ');
		editor.replaceContent(text, selection.start, selection.end);
		editor.createSelection(selection.start, selection.start + text.length);
	}
}

/**
 * Toggle comment on current editor's selection or HTML tag/CSS rule
 * @param {zen_editor} editor
 */
function toggleComment(editor) {
	switch (editor.getSyntax()) {
		case 'css':
			return toggleCSSComment(editor);
		default:
			return toggleHTMLComment(editor);
	}
}

/**
 * Toggle HTML comment on current selection or tag
 * @param {zen_editor} editor
 * @return {Boolean} Returns <code>true</code> if comment was toggled
 */
function toggleHTMLComment(editor) {
	var rng = editor.getSelectionRange(),
		content = editor.getContent();
		
	if (rng.start == rng.end) {
		// no selection, find matching tag
		var pair = zen_coding.html_matcher.getTags(content, editor.getCaretPos(), editor.getProfileName());
		if (pair && pair[0]) { // found pair
			rng.start = pair[0].start;
			rng.end = pair[1] ? pair[1].end : pair[0].end;
		}
	}
	
	return genericCommentToggle(editor, '<!--', '-->', rng.start, rng.end);
}

/**
 * Simple CSS commenting
 * @param {zen_editor} editor
 * @return {Boolean} Returns <code>true</code> if comment was toggled
 */
function toggleCSSComment(editor) {
	var rng = editor.getSelectionRange();
		
	if (rng.start == rng.end) {
		// no selection, get current line
		rng = editor.getCurrentLineRange();

		// adjust start index till first non-space character
		var _r = narrowToNonSpace(editor.getContent(), rng.start, rng.end);
		rng.start = _r[0];
		rng.end = _r[1];
	}
	
	return genericCommentToggle(editor, '/*', '*/', rng.start, rng.end);
}

/**
 * Search for nearest comment in <code>str</code>, starting from index <code>from</code>
 * @param {String} text Where to search
 * @param {Number} from Search start index
 * @param {String} start_token Comment start string
 * @param {String} end_token Comment end string
 * @return {Array|null} Returns null if comment wasn't found
 */
function searchComment(text, from, start_token, end_token) {
	var start_ch = start_token.charAt(0),
		end_ch = end_token.charAt(0),
		comment_start = -1,
		comment_end = -1;
	
	function hasMatch(str, start) {
		return text.substr(start, str.length) == str;
	}
		
	// search for comment start
	while (from--) {
		if (text.charAt(from) == start_ch && hasMatch(start_token, from)) {
			comment_start = from;
			break;
		}
	}
	
	if (comment_start != -1) {
		// search for comment end
		from = comment_start;
		var content_len = text.length;
		while (content_len >= from++) {
			if (text.charAt(from) == end_ch && hasMatch(end_token, from)) {
				comment_end = from + end_token.length;
				break;
			}
		}
	}
	
	return (comment_start != -1 && comment_end != -1) 
		? [comment_start, comment_end] 
		: null;
}

/**
 * Escape special regexp chars in string, making it usable for creating dynamic
 * regular expressions
 * @param {String} str
 * @return {String}
 */
function escapeForRegexp(str) {
  var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
  return str.replace(specials, "\\$&");
}

/**
 * Generic comment toggling routine
 * @param {zen_editor} editor
 * @param {String} comment_start Comment start token
 * @param {String} comment_end Comment end token
 * @param {Number} range_start Start selection range
 * @param {Number} range_end End selection range
 * @return {Boolean}
 */
function genericCommentToggle(editor, comment_start, comment_end, range_start, range_end) {
	var content = editor.getContent(),
		caret_pos = editor.getCaretPos(),
		new_content = null;
		
	/**
	 * Remove comment markers from string
	 * @param {Sting} str
	 * @return {String}
	 */
	function removeComment(str) {
		return str
			.replace(new RegExp('^' + escapeForRegexp(comment_start) + '\\s*'), function(str){
				caret_pos -= str.length;
				return '';
			}).replace(new RegExp('\\s*' + escapeForRegexp(comment_end) + '$'), '');
	}
	
	function hasMatch(str, start) {
		return content.substr(start, str.length) == str;
	}
		
	// first, we need to make sure that this substring is not inside 
	// comment
	var comment_range = searchComment(content, caret_pos, comment_start, comment_end);
	
	if (comment_range && comment_range[0] <= range_start && comment_range[1] >= range_end) {
		// we're inside comment, remove it
		range_start = comment_range[0];
		range_end = comment_range[1];
		
		new_content = removeComment(content.substring(range_start, range_end));
	} else {
		// should add comment
		// make sure that there's no comment inside selection
		new_content = comment_start + ' ' + 
			content.substring(range_start, range_end)
				.replace(new RegExp(escapeForRegexp(comment_start) + '\\s*|\\s*' + escapeForRegexp(comment_end), 'g'), '') +
			' ' + comment_end;
			
		// adjust caret position
		caret_pos += comment_start.length + 1;
	}

	// replace editor content
	if (new_content !== null) {
		editor.setCaretPos(range_start);
		editor.replaceContent(unindent(editor, new_content), range_start, range_end);
		editor.setCaretPos(caret_pos);
		return true;
	}
	
	return false;
}

/**
 * Splits or joins tag, e.g. transforms it into a short notation and vice versa:<br>
 * &lt;div&gt;&lt;/div&gt; → &lt;div /&gt; : join<br>
 * &lt;div /&gt; → &lt;div&gt;&lt;/div&gt; : split
 * @param {zen_editor} editor Editor instance
 * @param {String} [profile_name] Profile name
 */
function splitJoinTag(editor, profile_name) {
	var caret_pos = editor.getCaretPos(),
		profile = zen_coding.getProfile(profile_name || editor.getProfileName()),
		caret = zen_coding.getCaretPlaceholder();

	// find tag at current position
	var pair = zen_coding.html_matcher.getTags(editor.getContent(), caret_pos, editor.getProfileName());
	if (pair && pair[0]) {
		var new_content = pair[0].full_tag;
		
		if (pair[1]) { // join tag
			var closing_slash = ' /';
			if (profile.self_closing_tag === true)
				closing_slash = '/';
				
			new_content = new_content.replace(/\s*>$/, closing_slash + '>');
			
			// add caret placeholder
			if (new_content.length + pair[0].start < caret_pos)
				new_content += caret;
			else {
				var d = caret_pos - pair[0].start;
				new_content = new_content.substring(0, d) + caret + new_content.substring(d);
			}
			
			editor.replaceContent(new_content, pair[0].start, pair[1].end);
		} else { // split tag
			var nl = zen_coding.getNewline(),
				pad = zen_coding.getVariable('indentation');
			
			// define tag content depending on profile
			var tag_content = (profile.tag_nl === true)
					? nl + pad +caret + nl
					: caret;
					
			new_content = new_content.replace(/\s*\/>$/, '>') + tag_content + '</' + pair[0].name + '>';
			editor.replaceContent(new_content, pair[0].start, pair[0].end);
		}
		
		return true;
	} else {
		return false;
	}
}

/**
 * Returns line bounds for specific character position
 * @param {String} text
 * @param {Number} from Where to start searching
 * @return {Object}
 */
function getLineBounds(text, from) {
	var len = text.length,
		start = 0,
		end = len - 1;
	
	// search left
	for (var i = from - 1; i > 0; i--) {
		var ch = text.charAt(i);
		if (ch == '\n' || ch == '\r') {
			start = i + 1;
			break;
		}
	}
	// search right
	for (var j = from; j < len; j++) {
		var ch = text.charAt(j);
		if (ch == '\n' || ch == '\r') {
			end = j;
			break;
		}
	}
	
	return {start: start, end: end};
}

/**
 * Gracefully removes tag under cursor
 * @param {zen_editor} editor
 */
function removeTag(editor) {
	var caret_pos = editor.getCaretPos(),
		content = editor.getContent();
		
	// search for tag
	var pair = zen_coding.html_matcher.getTags(content, caret_pos, editor.getProfileName());
	if (pair && pair[0]) {
		if (!pair[1]) {
			// simply remove unary tag
			editor.replaceContent(zen_coding.getCaretPlaceholder(), pair[0].start, pair[0].end);
		} else {
			var tag_content_range = narrowToNonSpace(content, pair[0].end, pair[1].start),
				start_line_bounds = getLineBounds(content, tag_content_range[0]),
				start_line_pad = getLinePadding(content.substring(start_line_bounds.start, start_line_bounds.end)),
				tag_content = content.substring(tag_content_range[0], tag_content_range[1]);
				
			tag_content = unindentText(tag_content, start_line_pad);
			editor.replaceContent(zen_coding.getCaretPlaceholder() + tag_content, pair[0].start, pair[1].end);
		}
		
		return true;
	} else {
		return false;
	}
}

// register all actions
zen_coding.registerAction('expand_abbreviation', expandAbbreviation);
zen_coding.registerAction('expand_abbreviation_with_tab', expandAbbreviationWithTab);
zen_coding.registerAction('match_pair', matchPair);
zen_coding.registerAction('match_pair_inward', function(editor){
	matchPair(editor, 'in');
});

zen_coding.registerAction('match_pair_outward', function(editor){
	matchPair(editor, 'out');
});
zen_coding.registerAction('wrap_with_abbreviation', wrapWithAbbreviation);
zen_coding.registerAction('prev_edit_point', prevEditPoint);
zen_coding.registerAction('next_edit_point', nextEditPoint);
zen_coding.registerAction('insert_formatted_line_break', insertFormattedNewline);
zen_coding.registerAction('select_line', selectLine);
zen_coding.registerAction('matching_pair', goToMatchingPair);
zen_coding.registerAction('merge_lines', mergeLines);
zen_coding.registerAction('toggle_comment', toggleComment);
zen_coding.registerAction('split_join_tag', splitJoinTag);
zen_coding.registerAction('remove_tag', removeTag);
/**
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
(function(){
	// Regular Expressions for parsing tags and attributes
	var start_tag = /^<([\w\:\-]+)((?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
		end_tag = /^<\/([\w\:\-]+)[^>]*>/,
		attr = /([\w\-:]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
		
	// Empty Elements - HTML 4.01
	var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

	// Block Elements - HTML 4.01
	var block = makeMap("address,applet,blockquote,button,center,dd,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

	// Inline Elements - HTML 4.01
	var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

	// Elements that you can, intentionally, leave open
	// (and which close themselves)
	var close_self = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");
	
	/** Current matching mode */
	var cur_mode = 'xhtml';
	
	/** Last matched HTML pair */
	var last_match = {
		opening_tag: null, // tag() or comment() object
		closing_tag: null, // tag() or comment() object
		start_ix: -1,
		end_ix: -1
	};
	
	function setMode(new_mode) {
		if (!new_mode || new_mode != 'html')
			new_mode = 'xhtml';
			
		cur_mode = new_mode;
	}
	
	function tag(match, ix) {
		var name = match[1].toLowerCase();
		return  {
			name: name,
			full_tag: match[0],
			start: ix,
			end: ix + match[0].length,
			unary: Boolean(match[3]) || (name in empty && cur_mode == 'html'),
			has_close: Boolean(match[3]),
			type: 'tag',
			close_self: (name in close_self && cur_mode == 'html')
		};
	}
	
	function comment(start, end) {
		return {
			start: start,
			end: end,
			type: 'comment'
		};
	}
	
	function makeMap(str){
		var obj = {}, items = str.split(",");
		for ( var i = 0; i < items.length; i++ )
			obj[ items[i] ] = true;
		return obj;
	}
	
	/**
	 * Makes selection ranges for matched tag pair
	 * @param {tag} opening_tag
	 * @param {tag} closing_tag
	 * @param {Number} ix
	 */
	function makeRange(opening_tag, closing_tag, ix) {
		ix = ix || 0;
		
		var start_ix = -1, 
			end_ix = -1;
		
		if (opening_tag && !closing_tag) { // unary element
			start_ix = opening_tag.start;
			end_ix = opening_tag.end;
		} else if (opening_tag && closing_tag) { // complete element
			if (
				(opening_tag.start < ix && opening_tag.end > ix) || 
				(closing_tag.start <= ix && closing_tag.end > ix)
			) {
				start_ix = opening_tag.start;
				end_ix = closing_tag.end;
			} else {
				start_ix = opening_tag.end;
				end_ix = closing_tag.start;
			}
		}
		
		return [start_ix, end_ix];
	}
	
	/**
	 * Save matched tag for later use and return found indexes
	 * @param {tag} opening_tag
	 * @param {tag} closing_tag
	 * @param {Number} ix
	 * @return {Array}
	 */
	function saveMatch(opening_tag, closing_tag, ix) {
		ix = ix || 0;
		last_match.opening_tag = opening_tag; 
		last_match.closing_tag = closing_tag;
		
		var range = makeRange(opening_tag, closing_tag, ix);
		last_match.start_ix = range[0];
		last_match.end_ix = range[1];
		
		return last_match.start_ix != -1 ? [last_match.start_ix, last_match.end_ix] : null;
	}
	
	/**
	 * Handle unary tag: find closing tag if needed
	 * @param {String} text
	 * @param {Number} ix
	 * @param {tag} open_tag
	 * @return {tag|null} Closing tag (or null if not found) 
	 */
	function handleUnaryTag(text, ix, open_tag) {
		if (open_tag.has_close)
			return null;
		else {
			// TODO finish this method
		}
	}
	
	/**
	 * Search for matching tags in <code>html</code>, starting from 
	 * <code>start_ix</code> position
	 * @param {String} html Code to search
	 * @param {Number} start_ix Character index where to start searching pair 
	 * (commonly, current caret position)
	 * @param {Function} action Function that creates selection range
	 * @return {Array|null}
	 */
	function findPair(html, start_ix, mode, action) {
		action = action || makeRange;
		setMode(mode);
		
		var forward_stack = [],
			backward_stack = [],
			/** @type {tag()} */
			opening_tag = null,
			/** @type {tag()} */
			closing_tag = null,
			range = null,
			html_len = html.length,
			m,
			ix,
			tmp_tag;
			
		forward_stack.last = backward_stack.last = function() {
			return this[this.length - 1];
		}
		
		function hasMatch(str, start) {
			if (arguments.length == 1)
				start = ix;
			return html.substr(start, str.length) == str;
		}
		
		function searchCommentStart(from) {
			while (from--) {
				if (html.charAt(from) == '<' && hasMatch('<!--', from))
					break;
			}
			
			return from;
		}
		
		// find opening tag
		ix = start_ix;
		while (ix-- && ix >= 0) {
			var ch = html.charAt(ix);
			if (ch == '<') {
				var check_str = html.substring(ix, html_len);
				
				if ( (m = check_str.match(end_tag)) ) { // found closing tag
					tmp_tag = tag(m, ix);
					if (tmp_tag.start < start_ix && tmp_tag.end > start_ix) // direct hit on searched closing tag
						closing_tag = tmp_tag;
					else
						backward_stack.push(tmp_tag);
				} else if ( (m = check_str.match(start_tag)) ) { // found opening tag
					tmp_tag = tag(m, ix);
					
					if (tmp_tag.unary) {
						if (tmp_tag.start < start_ix && tmp_tag.end > start_ix) // exact match
							// TODO handle unary tag 
							return action(tmp_tag, null, start_ix);
					} else if (backward_stack.last() && backward_stack.last().name == tmp_tag.name) {
						backward_stack.pop();
					} else { // found nearest unclosed tag
						opening_tag = tmp_tag;
						break;
					}
				} else if (check_str.indexOf('<!--') == 0) { // found comment start
					var end_ix = check_str.search('-->') + ix + 3;
					if (ix < start_ix && end_ix >= start_ix)
						return action( comment(ix, end_ix) );
				}
			} else if (ch == '-' && hasMatch('-->')) { // found comment end
				// search left until comment start is reached
				ix = searchCommentStart(ix);
			}
		}
		
		if (!opening_tag)
			return action(null);
		
		// find closing tag
		if (!closing_tag) {
			for (ix = start_ix; ix < html_len; ix++) {
				var ch = html.charAt(ix);
				if (ch == '<') {
					var check_str = html.substring(ix, html_len);
					
					if ( (m = check_str.match(start_tag)) ) { // found opening tag
						tmp_tag = tag(m, ix);
						if (!tmp_tag.unary)
							forward_stack.push( tmp_tag );
					} else if ( (m = check_str.match(end_tag)) ) { // found closing tag
						var tmp_tag = tag(m, ix);
						if (forward_stack.last() && forward_stack.last().name == tmp_tag.name)
							forward_stack.pop();
						else { // found matched closing tag
							closing_tag = tmp_tag;
							break;
						}
					} else if (hasMatch('<!--')) { // found comment
						ix += check_str.search('-->') + 3;
					}
				} else if (ch == '-' && hasMatch('-->')) {
					// looks like cursor was inside comment with invalid HTML
					if (!forward_stack.last() || forward_stack.last().type != 'comment') {
						var end_ix = ix + 3;
						return action(comment( searchCommentStart(ix), end_ix ));
					}
				}
			}
		}
		
		return action(opening_tag, closing_tag, start_ix);
	}
	
	/**
	 * Search for matching tags in <code>html</code>, starting 
	 * from <code>start_ix</code> position. The result is automatically saved in 
	 * <code>last_match</code> property
	 * 
	 * @return {Array|null}
	 */
	var HTMLPairMatcher = function(/* String */ html, /* Number */ start_ix, /*  */ mode){
		return findPair(html, start_ix, mode, saveMatch);
	}
	
	HTMLPairMatcher.start_tag = start_tag;
	HTMLPairMatcher.end_tag = end_tag;
	
	/**
	 * Search for matching tags in <code>html</code>, starting from 
	 * <code>start_ix</code> position. The difference between 
	 * <code>HTMLPairMatcher</code> function itself is that <code>find</code> 
	 * method doesn't save matched result in <code>last_match</code> property.
	 * This method is generally used for lookups 
	 */
	HTMLPairMatcher.find = function(html, start_ix, mode) {
		return findPair(html, start_ix, mode);
	};
	
	/**
	 * Search for matching tags in <code>html</code>, starting from 
	 * <code>start_ix</code> position. The difference between 
	 * <code>HTMLPairMatcher</code> function itself is that <code>getTags</code> 
	 * method doesn't save matched result in <code>last_match</code> property 
	 * and returns array of opening and closing tags
	 * This method is generally used for lookups 
	 */
	HTMLPairMatcher.getTags = function(html, start_ix, mode) {
		return findPair(html, start_ix, mode, function(opening_tag, closing_tag){
			return [opening_tag, closing_tag];
		});
	};
	
	HTMLPairMatcher.last_match = last_match;
	
	try {
		zen_coding.html_matcher = HTMLPairMatcher;
	} catch(e){}
	
})();/**
 * Comment important tags (with 'id' and 'class' attributes)
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
(function(){
	/**
	 * Add comments to tag
	 * @param {ZenNode} node
	 */
	function addComments(node, i) {
		var id_attr = node.getAttribute('id'),
			class_attr = node.getAttribute('class'),
			nl = zen_coding.getNewline();
			
		if (id_attr || class_attr) {
			var comment_str = '',
				padding = (node.parent) ? node.parent.padding : '';
			if (id_attr) comment_str += '#' + id_attr;
			if (class_attr) comment_str += '.' + class_attr;
			
			node.start = node.start.replace(/</, '<!-- ' + comment_str + ' -->' + nl + padding + '<');
			node.end = node.end.replace(/>/, '>' + nl + padding + '<!-- /' + comment_str + ' -->');
			
			// replace counters
			node.start = zen_coding.replaceCounter(node.start, i + 1);
			node.end = zen_coding.replaceCounter(node.end, i + 1);
		}
	}
	
	function process(tree, profile) {
		if (profile.tag_nl === false)
			return tree;
			
		for (var i = 0, il = tree.children.length; i < il; i++) {
			/** @type {ZenNode} */
			var item = tree.children[i];
			
			if (item.isBlock())
				addComments(item, i);
			
			process(item, profile);
		}
		
		return tree;
	}
	
	zen_coding.registerFilter('c', process);
})();/**
 * Filter for escaping unsafe XML characters: <, >, &
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
(function(){
	var char_map = {
		'<': '&lt;',
		'>': '&gt;',
		'&': '&amp;'
	}
	
	function escapeChars(str) {
		return str.replace(/([<>&])/g, function(str, p1){
			return char_map[p1];
		});
	}
	
	function process(tree, profile, level) {
		for (var i = 0, il = tree.children.length; i < il; i++) {
			/** @type {ZenNode} */
			var item = tree.children[i];
			
			item.start = escapeChars(item.start);
			item.end = escapeChars(item.end);
			
			process(item);
		}
		
		return tree;
	}
	
	zen_coding.registerFilter('e', process);
})();/**
 * Format CSS properties: add space after property name:
 * padding:0; ? padding: 0;
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
(function(){
	function process(tree, profile) {
		for (var i = 0, il = tree.children.length; i < il; i++) {
			/** @type {ZenNode} */
			var item = tree.children[i];
			
			// CSS properties are always snippets 
			if (item.type == 'snippet') {
				item.start = item.start.replace(/([\w\-]+\s*:)\s*/, '$1 ');
			}
			
			process(item, profile);
		}
		
		return tree;
	}
	
	zen_coding.registerFilter('fc', process);
})();/**
 * Generic formatting filter: creates proper indentation for each tree node,
 * placing "%s" placeholder where the actual output should be. You can use
 * this filter to preformat tree and then replace %s placeholder to whatever you
 * need. This filter should't be called directly from editor as a part 
 * of abbreviation.
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "../zen_coding.js"
 */
(function(){
	var child_token = '${child}',
		placeholder = '%s';
	
	function getNewline() {
		return zen_coding.getNewline();
	}
	
	function getIndentation() {
		return zen_coding.getVariable('indentation');
	}
	
	/**
	 * Test if passed node has block-level sibling element
	 * @param {ZenNode} item
	 * @return {Boolean}
	 */
	function hasBlockSibling(item) {
		return (item.parent && item.parent.hasBlockChildren());
	}
	
	/**
	 * Test if passed itrem is very first child of the whole tree
	 * @param {ZenNode} tree
	 */
	function isVeryFirstChild(item) {
		return item.parent && !item.parent.parent && !item.previousSibling;
	}
	
	/**
	 * Need to add line break before element
	 * @param {ZenNode} node
	 * @param {Object} profile
	 * @return {Boolean}
	 */
	function shouldBreakLine(node, profile) {
		if (!profile.inline_break)
			return false;
			
		// find toppest non-inline sibling
		while (node.previousSibling && node.previousSibling.isInline())
			node = node.previousSibling;
		
		if (!node.isInline())
			return false;
			
		// calculate how many inline siblings we have
		var node_count = 1;
		while (node = node.nextSibling) {
			if (node.isInline())
				node_count++;
			else
				break;
		}
		
		return node_count >= profile.inline_break;
	}
	
	/**
	 * Need to add newline because <code>item</code> has too many inline children
	 * @param {ZenNode} node
	 * @param {Object} profile
	 */
	function shouldBreakChild(node, profile) {
		// we need to test only one child element, because 
		// hasBlockChildren() method will do the rest
		return (node.children.length && shouldBreakLine(node.children[0], profile));
	}
	
	/**
	 * Processes element with <code>snippet</code> type
	 * @param {ZenNode} item
	 * @param {Object} profile
	 * @param {Number} [level] Depth level
	 */
	function processSnippet(item, profile, level) {
		var data = item.source.value;
			
		if (!data)
			// snippet wasn't found, process it as tag
			return processTag(item, profile, level);
			
		item.start = item.end = placeholder;
		
		var padding = (item.parent) 
			? item.parent.padding
			: zen_coding.repeatString(getIndentation(), level);
		
		if (!isVeryFirstChild(item)) {
			item.start = getNewline() + padding + item.start;
		}
		
		// adjust item formatting according to last line of <code>start</code> property
		var parts = data.split(child_token),
			lines = zen_coding.splitByLines(parts[0] || ''),
			padding_delta = getIndentation();
			
		if (lines.length > 1) {
			var m = lines[lines.length - 1].match(/^(\s+)/);
			if (m)
				padding_delta = m[1];
		}
		
		item.padding = padding + padding_delta;
		
		return item;
	}
	
	/**
	 * Processes element with <code>tag</code> type
	 * @param {ZenNode} item
	 * @param {Object} profile
	 * @param {Number} [level] Depth level
	 */
	function processTag(item, profile, level) {
		if (!item.name)
			// looks like it's a root element
			return item;
		
		item.start = item.end = placeholder;
		
		var is_unary = (item.isUnary() && !item.children.length);
			
		// formatting output
		if (profile.tag_nl !== false) {
			var padding = (item.parent) 
					? item.parent.padding
					: zen_coding.repeatString(getIndentation(), level),
				force_nl = (profile.tag_nl === true),
				should_break = shouldBreakLine(item, profile);
			
			// formatting block-level elements
			if (( (item.isBlock() || should_break) && item.parent) || force_nl) {
				// snippet children should take different formatting
				if (!item.parent || (item.parent.type != 'snippet' && !isVeryFirstChild(item)))
					item.start = getNewline() + padding + item.start;
					
				if (item.hasBlockChildren() || shouldBreakChild(item, profile) || (force_nl && !is_unary))
					item.end = getNewline() + padding + item.end;
					
				if (item.hasTagsInContent() || (force_nl && !item.hasChildren() && !is_unary))
					item.start += getNewline() + padding + getIndentation();
				
			} else if (item.isInline() && hasBlockSibling(item) && !isVeryFirstChild(item)) {
				item.start = getNewline() + padding + item.start;
			}
			
			item.padding = padding + getIndentation();
		}
		
		return item;
	}
	
	/**
	 * Processes simplified tree, making it suitable for output as HTML structure
	 * @param {ZenNode} tree
	 * @param {Object} profile
	 * @param {Number} [level] Depth level
	 */
	function process(tree, profile, level) {
		level = level || 0;
		
		for (var i = 0, il = tree.children.length; i < il; i++) {
			/** @type {ZenNode} */
			var item = tree.children[i];
			item = (item.type == 'tag') 
				? processTag(item, profile, level) 
				: processSnippet(item, profile, level);
				
			if (item.content)
				item.content = zen_coding.padString(item.content, item.padding);
				
			process(item, profile, level + 1);
		}
		
		return tree;
	}
	
	zen_coding.registerFilter('_format', process);
})();/**
 * Filter that produces HAML tree
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "../zen_coding.js"
 */
(function(){
	var child_token = '${child}';
	
	/**
	 * Creates HTML attributes string from tag according to profile settings
	 * @param {ZenNode} tag
	 * @param {default_profile} profile
	 */
	function makeAttributesString(tag, profile) {
		// make attribute string
		var attrs = '',
			attr_quote = profile.attr_quotes == 'single' ? "'" : '"',
			cursor = profile.place_cursor ? zen_coding.getCaretPlaceholder() : '',
			attr_name, 
			i,
			a;
			
		// use short notation for ID and CLASS attributes
		for (i = 0; i < tag.attributes.length; i++) {
			a = tag.attributes[i];
			switch (a.name.toLowerCase()) {
				case 'id':
					attrs += '#' + (a.value || cursor);
					break;
				case 'class':
					attrs += '.' + (a.value || cursor);
					break;
			}
		}
		
		var other_attrs = [];
		
		// process other attributes
		for (i = 0; i < tag.attributes.length; i++) {
			a = tag.attributes[i];
			var attr_name_lower = a.name.toLowerCase();
			if (attr_name_lower != 'id' && attr_name_lower != 'class') {
				attr_name = (profile.attr_case == 'upper') ? a.name.toUpperCase() : attr_name_lower;
				other_attrs.push(':' +attr_name + ' => ' + attr_quote + (a.value || cursor) + attr_quote);
			}
		}
		
		if (other_attrs.length)
			attrs += '{' + other_attrs.join(', ') + '}';
		
		return attrs;
	}
	
	/**
	 * Processes element with <code>snippet</code> type
	 * @param {ZenNode} item
	 * @param {Object} profile
	 * @param {Number} [level] Depth level
	 */
	function processSnippet(item, profile, level) {
		var data = item.source.value;
			
		if (!data)
			// snippet wasn't found, process it as tag
			return processTag(item, profile, level);
			
		var parts = data.split(child_token),
			start = parts[0] || '',
			end = parts[1] || '',
			padding = item.parent ? item.parent.padding : '';
			
		item.start = item.start.replace('%s', zen_coding.padString(start, padding));
		item.end = item.end.replace('%s', zen_coding.padString(end, padding));
		
		return item;
	}
	
	/**
	 * Test if passed node has block-level sibling element
	 * @param {ZenNode} item
	 * @return {Boolean}
	 */
	function hasBlockSibling(item) {
		return (item.parent && item.parent.hasBlockChildren());
	}
	
	/**
	 * Processes element with <code>tag</code> type
	 * @param {ZenNode} item
	 * @param {Object} profile
	 * @param {Number} [level] Depth level
	 */
	function processTag(item, profile, level) {
		if (!item.name)
			// looks like it's root element
			return item;
		
		var attrs = makeAttributesString(item, profile), 
			content = '', 
			cursor = profile.place_cursor ? zen_coding.getCaretPlaceholder() : '',
			self_closing = '',
			is_unary = (item.isUnary() && !item.children.length),
			start= '',
			end = '';
		
		if (profile.self_closing_tag && is_unary)
			self_closing = '/';
			
		// define tag name
		var tag_name = '%' + ((profile.tag_case == 'upper') ? item.name.toUpperCase() : item.name.toLowerCase());
		if (tag_name.toLowerCase() == '%div' && attrs && attrs.indexOf('{') == -1)
			// omit div tag
			tag_name = '';
			
		item.end = '';
		start = tag_name + attrs + self_closing;
		
		var placeholder = '%s';
		// We can't just replace placeholder with new value because
		// JavaScript will treat double $ character as a single one, assuming
		// we're using RegExp literal. 
		var pos = item.start.indexOf(placeholder);
		item.start = item.start.substring(0, pos) + start + item.start.substring(pos + placeholder.length);
		
		if (!item.children.length && !is_unary)
			item.start += cursor;
		
		return item;
	}
	
	/**
	 * Processes simplified tree, making it suitable for output as HTML structure
	 * @param {ZenNode} tree
	 * @param {Object} profile
	 * @param {Number} [level] Depth level
	 */
	function process(tree, profile, level) {
		level = level || 0;
		if (level == 0)
			// preformat tree
			tree = zen_coding.runFilters(tree, profile, '_format');
		
		for (var i = 0, il = tree.children.length; i < il; i++) {
			/** @type {ZenNode} */
			var item = tree.children[i];
			item = (item.type == 'tag') 
				? processTag(item, profile, level) 
				: processSnippet(item, profile, level);
			
			// replace counters
			item.start = zen_coding.replaceCounter(item.start, i + 1);
			item.end = zen_coding.replaceCounter(item.end, i + 1);
			process(item, profile, level + 1);
		}
		
		return tree;
	}
	
	zen_coding.registerFilter('haml', process);
})();/**
 * Filter that produces HTML tree
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 * 
 * @include "../zen_coding.js"
 */
(function(){
	var child_token = '${child}';
	
	/**
	 * Creates HTML attributes string from tag according to profile settings
	 * @param {ZenNode} tag
	 * @param {default_profile} profile
	 */
	function makeAttributesString(tag, profile) {
		// make attribute string
		var attrs = '',
			attr_quote = profile.attr_quotes == 'single' ? "'" : '"',
			cursor = profile.place_cursor ? zen_coding.getCaretPlaceholder() : '',
			attr_name;
			
		for (var i = 0; i < tag.attributes.length; i++) {
			var a = tag.attributes[i];
			attr_name = (profile.attr_case == 'upper') ? a.name.toUpperCase() : a.name.toLowerCase();
			attrs += ' ' + attr_name + '=' + attr_quote + (a.value || cursor) + attr_quote;
		}
		
		return attrs;
	}
	
	/**
	 * Processes element with <code>snippet</code> type
	 * @param {ZenNode} item
	 * @param {Object} profile
	 * @param {Number} [level] Depth level
	 */
	function processSnippet(item, profile, level) {
		var data = item.source.value;
			
		if (!data)
			// snippet wasn't found, process it as tag
			return processTag(item, profile, level);
			
		var parts = data.split(child_token),
			start = parts[0] || '',
			end = parts[1] || '',
			padding = item.parent ? item.parent.padding : '';
			
			
		item.start = item.start.replace('%s', zen_coding.padString(start, padding));
		item.end = item.end.replace('%s', zen_coding.padString(end, padding));
		
		return item;
	}
	
	/**
	 * Test if passed node has block-level sibling element
	 * @param {ZenNode} item
	 * @return {Boolean}
	 */
	function hasBlockSibling(item) {
		return (item.parent && item.parent.hasBlockChildren());
	}
	
	/**
	 * Processes element with <code>tag</code> type
	 * @param {ZenNode} item
	 * @param {Object} profile
	 * @param {Number} [level] Depth level
	 */
	function processTag(item, profile, level) {
		if (!item.name)
			// looks like it's root element
			return item;
		
		var attrs = makeAttributesString(item, profile), 
			content = '', 
			cursor = profile.place_cursor ? zen_coding.getCaretPlaceholder() : '',
			self_closing = '',
			is_unary = (item.isUnary() && !item.children.length),
			start= '',
			end = '';
		
		if (profile.self_closing_tag == 'xhtml')
			self_closing = ' /';
		else if (profile.self_closing_tag === true)
			self_closing = '/';
			
		// define opening and closing tags
		var tag_name = (profile.tag_case == 'upper') ? item.name.toUpperCase() : item.name.toLowerCase();
		if (is_unary) {
			start = '<' + tag_name + attrs + self_closing + '>';
			item.end = '';
		} else {
			start = '<' + tag_name + attrs + '>';
			end = '</' + tag_name + '>';
		}
		
		var placeholder = '%s';
		// We can't just replace placeholder with new value because
		// JavaScript will treat double $ character as a single one, assuming
		// we're using RegExp literal. 
		var pos = item.start.indexOf(placeholder);
		item.start = item.start.substring(0, pos) + start + item.start.substring(pos + placeholder.length);
		
		pos = item.end.indexOf(placeholder);
		item.end = item.end.substring(0, pos) + end + item.end.substring(pos + placeholder.length);
		
		if (!item.children.length && !is_unary)
			item.start += cursor;
		
		return item;
	}
	
	/**
	 * Processes simplified tree, making it suitable for output as HTML structure
	 * @param {ZenNode} tree
	 * @param {Object} profile
	 * @param {Number} [level] Depth level
	 */
	function process(tree, profile, level) {
		level = level || 0;
		if (level == 0)
			tree = zen_coding.runFilters(tree, profile, '_format');
		
		for (var i = 0, il = tree.children.length; i < il; i++) {
			/** @type {ZenNode} */
	
			var item = tree.children[i];
			item = (item.type == 'tag') 
				? processTag(item, profile, level) 
				: processSnippet(item, profile, level);
			
			// replace counters
			item.start = zen_coding.replaceCounter(item.start, item.counter);
			item.end = zen_coding.replaceCounter(item.end, item.counter);
			process(item, profile, level + 1);
		}
		
		return tree;
	}
	
	zen_coding.registerFilter('html', process);
})();/**
 * Filter for trimming "select" attributes from some tags that contains
 * child elements
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */
(function(){
	var tags = {
		'xsl:variable': 1,
		'xsl:with-param': 1
	};
	
	/**
	 * Removes "select" attribute from node
	 * @param {ZenNode} node
	 */
	function trimAttribute(node) {
		node.start = node.start.replace(/\s+select\s*=\s*(['"]).*?\1/, '');
	}
	
	function process(tree) {
		for (var i = 0, il = tree.children.length; i < il; i++) {
			/** @type {ZenNode} */
			var item = tree.children[i];
			if (item.type == 'tag' && item.name.toLowerCase() in tags && item.children.length)
				trimAttribute(item);
			process(item);
		}
	}
	
	zen_coding.registerFilter('xsl', process);
})();return zen_coding;	
})();/**
 * High-level editor interface that communicates with underlying editor (like 
 * TinyMCE, CKEditor, etc.) or browser.
 * Basically, you should call <code>zen_editor.setContext(obj)</code> method to
 * set up undelying editor context before using any other method.
 * 
 * This interface is used by <i>zen_actions.js</i> for performing different 
 * actions like <b>Expand abbreviation</b>  
 * 
 * @example
 * var textarea = document.getElemenetsByTagName('textarea')[0];
 * zen_editor.setContext(textarea);
 * //now you are ready to use editor object
 * zen_editor.getSelectionRange();
 * 
 * @author Sergey Chikuyonok (serge.che@gmail.com)
 * @link http://chikuyonok.ru
 */

var zen_editor = (function(){
	var context = null;
	
	var know_syntaxes = {
		'html': 1,
		'css': 1,
		'xml': 1,
		'xsl': 1,
		'haml': 1
	};
	
	/**
	 * Find start and end index of text line for <code>from</code> index
	 * @param {String} text 
	 * @param {Number} from 
	 */
	function findNewlineBounds(text, from) {
		var len = text.length,
			start = 0,
			end = len - 1;
		
		// search left
		for (var i = from - 1; i > 0; i--) {
			var ch = text.charAt(i);
			if (ch == '\n' || ch == '\r') {
				start = i + 1;
				break;
			}
		}
		// search right
		for (var j = from; j < len; j++) {
			var ch = text.charAt(j);
			if (ch == '\n' || ch == '\r') {
			//if (ch == '\n' || ch == '\r') {
				end = j;
				break;
			}
		}
		
		return {start: start, end: end};
	}
	
	/**
	 * Returns whitrespace padding of string
	 * @param {String} str String line
	 * @return {String}
	 */
	function getStringPadding(str) {
		return (str.match(/^(\s+)/) || [''])[0];
	}
	
	return {
		/**
		 * Setup underlying editor context. You should call this method 
		 * <code>before</code> using any Zen Coding action.
		 * @param {Object} context
		 */
		setContext: function(ctx) {
			context = ctx;
		},
		
		/**
		 * Returns character indexes of selected text: object with <code>start</code>
		 * and <code>end</code> properties. If there's no selection, should return 
		 * object with <code>start</code> and <code>end</code> properties referring
		 * to current caret position
		 * @return {Object}
		 * @example
		 * var selection = zen_editor.getSelectionRange();
		 * alert(selection.start + ', ' + selection.end); 
		 */
		getSelectionRange: function() {
			var cachePos = context.pos;
			var cacheAnchor = context.anchor;
			return {
				start: Math.min(cacheAnchor, cachePos),
				end: Math.max(cacheAnchor, cachePos)
			};
		},
		
		/**
		 * Creates selection from <code>start</code> to <code>end</code> character
		 * indexes. If <code>end</code> is ommited, this method should place caret 
		 * and <code>start</code> index
		 * @param {Number} start
		 * @param {Number} [end]
		 * @example
		 * zen_editor.createSelection(10, 40);
		 * 
		 * //move caret to 15th character
		 * zen_editor.createSelection(15);
		 */
		createSelection: function(start, end) {
			context.anchor = start;
			context.pos = end;
		},
		
		/**
		 * Returns current line's start and end indexes as object with <code>start</code>
		 * and <code>end</code> properties
		 * @return {Object}
		 * @example
		 * var range = zen_editor.getCurrentLineRange();
		 * alert(range.start + ', ' + range.end);
		 */
		getCurrentLineRange: function() {
			return findNewlineBounds(this.getContent(), this.getCaretPos());
		},
		
		/**
		 * Returns current caret position
		 * @return {Number|null}
		 */
		getCaretPos: function(){
			return context.pos;
		},
		
		/**
		 * Set new caret position
		 * @param {Number} pos Caret position
		 */
		setCaretPos: function(pos) {
			context.anchor = context.pos = pos;
		},
		
		/**
		 * Returns content of current line
		 * @return {String}
		 */
		getCurrentLine: function() {
			var range = this.getCurrentLineRange();
			return this.getContent().substring(range.start, range.end);
		},
		
		/**
		 * Replace editor's content or it's part (from <code>start</code> to 
		 * <code>end</code> index). If <code>value</code> contains 
		 * <code>caret_placeholder</code>, the editor will put caret into 
		 * this position. If you skip <code>start</code> and <code>end</code>
		 * arguments, the whole target's content will be replaced with 
		 * <code>value</code>. 
		 * 
		 * If you pass <code>start</code> argument only,
		 * the <code>value</code> will be placed at <code>start</code> string 
		 * index of current content. 
		 * 
		 * If you pass <code>start</code> and <code>end</code> arguments,
		 * the corresponding substring of current target's content will be 
		 * replaced with <code>value</code>. 
		 * @param {String} value Content you want to paste
		 * @param {Number} [start] Start index of editor's content
		 * @param {Number} [end] End index of editor's content
		 */
		replaceContent: function(value, start, end) {
			var caret_pos = this.getCaretPos(),
				caret_placeholder = zen_coding.getCaretPlaceholder(),
				has_start = typeof(start) !== 'undefined',
				has_end = typeof(end) !== 'undefined';
				
			// indent new value
			value = zen_coding.padString(value, getStringPadding(this.getCurrentLine()));
			
			// find new caret position
			var new_pos = value.indexOf(caret_placeholder);
			if (new_pos != -1) {
				caret_pos = (start || 0) + new_pos;
				value = value.split(caret_placeholder).join('');
				
				// adjust caret position by line count
//				var lines = zen_coding.splitByLines(value.substring(0, new_pos));
//				caret_pos += lines.length - 1;
			} else {
				caret_pos = value.length + (start || 0);
				
				// adjust caret position by line count
//				var lines = zen_coding.splitByLines(value);
//				caret_pos += lines.length - 1;
			}
			
			if (!has_start && !has_end) {
				start = 0;
				end = content.length;
			} else if (!has_end) {
				end = start;
			}
			
			this.createSelection(start, end);
			context.selection = value;
			this.setCaretPos(caret_pos);
		},
		
		/**
		 * Returns editor's content
		 * @return {String}
		 */
		getContent: function(){
			return context.text || '';
		},
		
		/**
		 * Returns current editor's syntax mode
		 * @return {String}
		 */
		getSyntax: function() {
			var syntax = (Editor.langs[context.lang] || '').toLowerCase(),
				caret_pos = this.getCaretPos();

			if (syntax == 'xml' && /\.xsl(t)?$/i.test(context.files[context.file]))
				syntax = 'xsl';

			if (!(syntax in know_syntaxes)) {
				syntax = 'html';
			}
			
			if (syntax == 'html') {
				// get the context tag
				var pair = zen_coding.html_matcher.getTags(this.getContent(), caret_pos);
				if (pair && pair[0] && pair[0].type == 'tag' && pair[0].name.toLowerCase() == 'style') {
					// check that we're actually inside the tag
					if (pair[0].end <= caret_pos && pair[1].start >= caret_pos)
						syntax = 'css';
				}
			}
			return syntax;
		},
		
		/**
		 * Returns current output profile name (@see zen_coding#setupProfile)
		 * @return {String}
		 */
		getProfileName: function() {
			return 'xhtml';
		}
	};
})();

/**
 * Zen Coding manager that runs actions
 * @param {String} action_name Action to call
 * @return {Boolean} Returns 'true' if action ran successfully
 */
function zc_manager(action_name) {
	zen_editor.setContext(Editor.currentView);
	if (action_name == 'wrap_with_abbreviation') {
		var abbr = prompt('Enter Abbreviation', function(abbr){
			if (abbr)
				zen_coding.runAction(action_name, zen_editor, abbr);
		});
	} else {
		return zen_coding.runAction(action_name, zen_editor);
	}
}

function prompt(title, callback) {
	Dialog.prompt(title, "", callback);
}