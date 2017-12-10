var mysql = require("./db-connection").pool;

function getListings(query, callback) {
    var city = query.city;
    var location = query.location;
    var sortByPrice = query.sortByPrice;
    var sortByDate = query.sortByDate;
    mysql.getConnection(function(err, con) {
        var sql = "SELECT * FROM listing";
        if (city || location) {
            sql += " WHERE";
            if (city) {
                sql += (" city LIKE '%" + city + "%'");
            }
            if (location) {
                if (city) {
                    sql += " AND"
                }
                sql += (" location LIKE '%" + location + "%'");
            }
             sql += " AND status != 2"
        }

        if(sortByPrice || sortByDate) {
            sql += " ORDER BY "
            if(sortByPrice) {
                sql += " price " + sortByPrice;
            }
            if(sortByDate) {
                if(sortByPrice) sql += ", ";
                sql += " listed_date " + sortByDate;
            }

        }

        console.log("Query to be executed: " + sql);

        con.query(sql, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        });
        con.release();
    });
}

function getListingsByUserId(agentId, callback) {
    mysql.getConnection(function(err, con) {
        var sql = "SELECT * FROM listing WHERE agent_id = " + agentId;
        console.log("Query to be executed: " + sql);
        con.query(sql, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        });
        con.release();
    });
}

function getListingByListingId(listingId, callback) {
    mysql.getConnection(function(err, con) {
        var sql = "SELECT l.*, a.name 'agent_name', a.email 'agent_email', a.contact 'agent_contact', a.address 'agent_address' FROM listing l, user a WHERE listing_id = " + listingId + " and l.agent_id = a.user_id";
        console.log("Query to be executed: " + sql);
        con.query(sql, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        });
        con.release();
    });
}

function deleteListingByListingId(listingId, callback) {
    mysql.getConnection(function(err, con) {
        deleteListingImagesByListingId(listingId);
        var sql = "DELETE FROM listing WHERE listing_id = " + listingId;
        console.log("Query to be executed: " + sql);
        con.query(sql, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        });
        con.release();
    });
}

function deleteListingImagesByListingId(listingId) {
    mysql.getConnection(function(err, con) {
        var sql = "DELETE FROM listing_images WHERE listing_id = " + listingId;
        console.log("Query to be executed: " + sql);
        con.query(sql, function (err, result) {
            if (err) return false;
            else return true;
        });
        con.release();
    });
}

function addListing(listing, imagesData, callback) {
    mysql.getConnection(function(err, con) {
        var sql = "INSERT INTO listing SET ?",
            values = {
                title: listing.title,
                description: listing.description,
                price: listing.price,
                is_biddable: listing.biddable ? (listing.biddable === "on" ? 1 : 0) : 0,
                area: listing.area,
                status: listing.status != null && listing.status != '' ? listing.status : 0,
                address: listing.address,
                expiry_date: listing.expiryDate != null && listing.expiryDate != "" ? listing.expiryDate : null,
                agent_id: listing.agentId,
                customer_id: listing.customerId != null && listing.customerId != "null" ? listing.customerId : null,
                city: listing.city,
                location: listing.location,
                baths: listing.baths,
                beds: listing.beds,
                total_images: imagesData.images ? (imagesData.images instanceof Array ? imagesData.images.length : 1) : 0
            };
        con.query(sql, values, function (err, result) {
            if (err) callback(err, null);
            else {
                if(imagesData.images) {
                    if(imagesData.images instanceof Array) {
                        imagesData.images.forEach(function(img) {
                            addListingImage(result.insertId, img);
                        });
                    } else{
                        addListingImage(result.insertId, imagesData.images);
                    }
                }
                callback(null, result);
            }
        });
        con.release();
    });
}

function addListingImage(listingId, image) {
    mysql.getConnection(function(err, con) {
        var sql = "INSERT INTO listing_images SET ?",
            values = {
                listing_id: listingId,
                image: image ? image.data : null,
            };
        con.query(sql, values, function (err, result) {
            if (err) console.log("Error while uploading image.");
            else console.log("Image uploaded successfully");
        });
        con.release();
    });
}

function updateListing(listing, callback) {
    mysql.getConnection(function(err, con) {
        var sql = "UPDATE listing SET ? WHERE listing_id = " + listing.listingId,
            values = {
                title: listing.title,
                description: listing.description,
                price: listing.price,
                is_biddable: listing.isBiddable,
                area: listing.area,
                status: listing.status,
                address: listing.address,
                expiry_date: listing.expiryDate,
                agent_id: listing.agentId,
                city: listing.city,
                location: listing.location,
                baths: listing.baths,
                beds: listing.beds
            };
        con.query(sql, values, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        });
        con.release();
    });
}


function getListingImageById(listingId, callback) {
    mysql.getConnection(function(err, con) {
        var sql = "SELECT image FROM listing_images WHERE listing_id = " + listingId;
        console.log("Query to be executed: " + sql);
        con.query(sql, function (err, result) {
            if (err) callback(err, null);
            else callback(null, result);
        });
        con.release();
    });
}

module.exports.getListings = getListings;
module.exports.getListingByListingId = getListingByListingId;
module.exports.addListing = addListing;
module.exports.getListingsByUserId = getListingsByUserId;
module.exports.deleteListingByListingId = deleteListingByListingId;
module.exports.updateListing = updateListing;
module.exports.getListingImageById = getListingImageById;
module.exports.addListingImage = addListingImage;