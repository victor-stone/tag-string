    Manipulate tags 

    tag              := ascii alphanumeric and underscore (depending on the 
                         'ignore' and 'invalid' options)
    tag string       := tags is separated by commas possibly with commas at the
                         start and end of string   
    tag parameter    := can be any one of: 
                            tag string
                            array
                            instance of TagString
    
    Class ensure unique (unordered) values.

    All (most?) parameters are flexible enough to accept strings, arrays or 
    instances of TagString. HOWEVER note that all methods assume that the 
    instance running the method vs.the parameter(s) passed in use the exact
    same rules for invalid, ignoring tags and separator.
    
    If you need to combine or operate with two different set of rules then
    only use instances of TagString and then assume that the instance running
    the methods owns the final outcome.
    
    Creation options are:
        - source     initial tags
        - ignore:    a RegExp of tags to ignore. By default the tag 'all' 
        - invalid:   a RegExp of characters that are not allowed in tags. By 
                     default [^-a-zA-Z0-9_]
        - separator: for when splitting incoming strings and building
                     serialized strings. Default is comma ','
                      
    Examples:     
````javascript    
        var tags1 = new TagString( 'foo,bar' );
        
        var tags2 = new TagString( [ 'fee', 'fie' ] );
        
        var tags3 = TagString(tags2,{ separator: ' '}); // conver to space delimited
        
        tags2.add(tags1);  // fee,fie,foo,bar
        tags2.toggle( ['fie','foo'], false ); // fee,bar
        tags3.remove('fee'); // fie
````        
