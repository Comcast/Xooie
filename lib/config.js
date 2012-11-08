/*
 * Binds a context (the 'this') to the function.  This works similarly to the
 * ECMAScript5 method .bind().  NOTE: This was changed to bind from context
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function(context) {
        var f = this,
            args = Array.prototype.slice.call(arguments, 1);

        return function() {
            return f.apply(context, args.concat(Array.prototype.slice.call(arguments)));
        };
    };
}

require.config({
    baseUrl: 'xui',
    paths: {
        jquery: '/lib/jquery'
    }
});