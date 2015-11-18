define([
    'mocha', 'chai', 'jQuery'
], function (
    mocha, chai, jQuery
) {

    var expect       = chai.expect,
        testDocument = null;

    return function () {

        function loadURL (path, done) {
            var iframe = jQuery('#test-document');
            iframe.load( function () {
                testDocument = iframe.get(0).contentWindow.document;
                done();
            })
            iframe.attr('src', 'http://localhost:8080');
        }

        describe('GUI Tests', function () {
            before('load /', function (done){
                loadURL('/', done);
            });

            describe('should pass', function () {
                it('should equal 2', function () {
                    expect(1 + 1).to.equal(2);
                });

                it('should not equal 3', function () {
                    expect(1 + 1).to.not.equal(3);
                });

                it('should equal 3', function () {
                    expect(1 + 1 + 1).to.equal(3);
                });
            });
        });

    };
});
