/*
*   Copyright 2012 Comcast
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

define(['jquery'], function($) {

    var Stylesheet = function(name){
        var i, title;

        title = 'stylesheet-' + name;

        //check to see if a stylesheet already exists with this name
        this.element = $('style[title=' + title + ']');

        //if it does, use it, else create a new one
        this.element = this.element.length > 0 ? this.element : $(['<style title="' + title + '">',
                            '/* This is a dynamically generated stylesheet: ' + name + ' */',
                        '</style>'].join('')).appendTo($('body'));

        if (document.styleSheets) {
            for (i = 0; i < document.styleSheets.length; i += 1){
                if (document.styleSheets[i].title === title) {
                    this.styleSheet = document.styleSheets[i];
                }
            }
        }
    };

    Stylesheet.prototype.getRule = function(ruleName){
        ruleName = ruleName.toLowerCase();

        var i, rules;

        //Check if this uses the IE format (styleSheet.rules) or the Mozilla/Webkit format
        rules = this.styleSheet.cssRules || this.styleSheet.rules;

        for (i = 0; i < rules.length; i += 1){
            if (rules[i].selectorText.toLowerCase() === ruleName) {
                return rules[i];
            }
        }

        return false;
    };

    Stylesheet.prototype.addRule = function(ruleName){
        var rule = this.getRule(ruleName), index;

        if (!rule){
            if (this.styleSheet.insertRule) {
                //This is the W3C-preferred method
                index = this.styleSheet.cssRules.length;
                this.styleSheet.insertRule(ruleName + ' { }', index);
                rule = this.styleSheet.cssRules[index];
            } else {
                //support for IE < 9
                index = this.styleSheet.rules.length;
                this.styleSheet.addRule(ruleName, null, index);
                rule = this.styleSheet.rules[index];
            }
        }

        return rule;
    };

    Stylesheet.prototype.deleteRule = function(ruleName){
        ruleName = ruleName.toLowerCase();

        var i, rules;

        //Check if this uses the IE format (styleSheet.rules) or the Mozilla/Webkit format
        rules = this.styleSheet.cssRules || this.styleSheet.rules;

        for (i = 0; i < rules.length; i += 1){
            if (rules[i].selectorText.toLowerCase() === ruleName) {
                if (this.styleSheet.deleteRule) {
                    //this is the W3C-preferred method
                    this.styleSheet.deleteRule(i);
                } else {
                    //support for IE < 9
                    this.styleSheet.removeRule(i);
                }

                return true;
            }
        }

        return false;
    };

    return Stylesheet;

});