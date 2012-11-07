define('utils', function(){
   var Utils = {
      /*
         * outOfRange 
         * @param {number} lower The smaller number defining a range
         * @param {number} upper The larger number defining a range
         * @param {number} point The number in question
         * @param {boolean} normalize Optional, if true the fuction will return a vector-normalized result (-1, 0, 1)
         * @return {number} Indicating how far out of range the point argument is.
         *                  Negative values are less than the low-end of the range.
         *                  positive value are greater than the high-end of the range.
         *                  zero value is within range.
         *
         * EXAMPLES:
         *  outOfRange(10, 18,  7)  returns -3
         *  outOfRange(10, 18, 13)  returns 0
         *  outOfRange(10, 18, 20)  returns 2
         *  outOfRange(10, 18,  7, true)  returns -1
         *  outOfRange(10, 18, 13, true)  returns 0
         *  outOfRange(10, 18, 20, true)  returns 1
         * 
         * NOTES: 
         *  vector normalization formula is n/abs(n)
         *  denominator will equal 1 if normalize is false and the absolute value of n when normalize is true, unless n is zero.
         *  denominator can NOT be zero, duh
         * 
         */
        outOfRange: function(lower, upper, point, normalize) {
            var n = ( Math.min(lower, point) - lower ) || ( Math.max(upper, point) - upper );
            var denominator = (normalize) ? Math.max(Math.abs(n),1) : 1;
            return n/denominator;
        }
   }

   return Utils;
});