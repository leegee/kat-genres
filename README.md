# KAT Genres

A work in progess to improve KAT genres for TV shows and films.

    npm install --dev
    npm test

# APIs

* [KAT](https://kat.cr/api)
* [OMDb](http://omdbapi.com)
* [DBpedia](http://dbpedia.org)

# Contents

* Node apps to import KAT data, gather genres, and populate to Elasticsearch
* Mach JSON REST middleware to Elasticsearch for testing
* Tiny Backbone app to search

# Elasticsearch

ES support is trivial but designed to be easy to update.

NB: Enable CORS in `$elasticsearch/config/elasticsearch.yaml`:

```
http:
    "cors.enabled" : true,
    "cors.allow-origin": "*"
```

# Author

Lee Goddard
