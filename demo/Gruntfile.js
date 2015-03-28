module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        // Connect web server.
        connect: {
            server: {
                options: {
                    port: 5000,
                    base: './',
                    keepalive: true
                }
            }
        }
    });
    
    // Enable Grunt connect webserver.
    grunt.loadNpmTasks('grunt-contrib-connect');
    
    // Default task(s).
    grunt.registerTask('default', []);
}