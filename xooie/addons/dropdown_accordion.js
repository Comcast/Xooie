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

define(['jquery', 'addons_base'], function($, Base){

    var Accordion = Base('accordion', function() {
        var self = this;

        this.module.getHandle().on('dropdownExpand', function(event){
            var activeHandles = self.module.getHandle().not(this).filter('.' + self.module.options.activeDropdownClass),
                i = 0,
                index;

            for (; i < activeHandles.length; i += 1) {
                index = parseInt($(activeHandles[i]).attr('data-dropdown-index'), 10);

                self.module.collapse(index, 0);
            }

        });
    });

    return Accordion;

});