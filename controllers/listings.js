const { model } = require("mongoose");
const Listing = require("../models/listing");
const axios = require('axios');



// Index Route...
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};


// New Route...
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


// Show Route...
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }}).populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
};




// Create Route...
module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

// For Map...
// Fetch coordinates from Nominatim API
const geoData = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
        q: newListing.location,    // location comes from the form
        format: 'json',
        limit: 1
    },
    headers: {
        'User-Agent': 'Wanderlust-App-Project' // Nominatim requires User-Agent
    }
});


if (geoData.data.length > 0) {
    newListing.geometry = {
        type: 'Point',
        coordinates: [
            parseFloat(geoData.data[0].lon),   // longitude first
            parseFloat(geoData.data[0].lat)    // latitude second
        ]
    };
} else {
    req.flash('error', 'Location not found. Please try a different location.');
    return res.redirect('/listings/new');
}

await newListing.save();
req.flash("success","New listing created");
res.redirect("/listings");
};




// Edit Route...
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};



// Update Route...
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

   if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };


    // Fetch coordinates from Nominatim API
    const geoData = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
            q: req.body.listings.location,    // location comes from the form
            format: 'json',
            limit: 1
        },
        headers: {
            'User-Agent': 'Wanderlust-App-Project' // Nominatim requires User-Agent
        }
    });

    
    if (geoData.data.length > 0) {
        listings.geometry = {
            type: 'Point',
            coordinates: [
                parseFloat(geoData.data[0].lon),   // longitude first
                parseFloat(geoData.data[0].lat)    // latitude second
            ]
        };
    } else {
        req.flash('error', 'Location not found. Please try a different location.');
        return res.redirect(`/listings/${id}`);
    }


    await listing.save();
   };
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


// Destroy Route...
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
