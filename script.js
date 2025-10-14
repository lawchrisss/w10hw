// ===== Your MAP spec (titles set to APPLE) =====
const mapSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": 1200,
  "height": 700,

  "title": {
    "text": "Global Iphone Market Share",
    "subtitle": "AS OF 2025",
    "fontSize": 22,
    "fontWeight": "bold",
    "anchor": "middle",
    "dx": 70,
    "dy": 50
  },

  "padding": { "left": -100, "right": 10 },

  "projection": {
    "type": "equalEarth",
    "center": [3, 8],
    "scale": 240
  },

  "data": {
    "url": "https://raw.githubusercontent.com/lawchrisss/w10hw/refs/heads/main/ne_110m_admin_0_countries%20(1).json",
    "format": { "type": "topojson", "feature": "2ne_110m_admin_0_countries" }
  },

  "transform": [
    {
      "lookup": "properties.ISO_A2",
      "from": {
        "data": {
          "url": "https://raw.githubusercontent.com/lawchrisss/w10hw/refs/heads/main/iphone-market-share-clean.csv"
        },
        "key": "iso2",
        "fields": ["country", "iPhoneMarketShare_2024"]
      }
    },
    { "calculate": "toNumber(datum.iPhoneMarketShare_2024)", "as": "share" }
  ],

  "mark": { "type": "geoshape", "stroke": "grey", "strokeWidth": 0.4 },

  "encoding": {
    "color": {
      "field": "share",
      "type": "quantitative",
      "scale": {
        "domain": [0, 100],
        "range": [
          "#FFF7B2","#FDE29A","#FBC38C","#F79A84","#E97A8A",
          "#D45C92","#B84C98","#943E9C","#6F3A9D","#4C2E7F"
        ],
        "interpolate": "rgb",
        "clamp": true
      },
      "legend": {
        "title": "iPhone Market Share (%)",
        "orient": "none",
        "direction": "horizontal",
        "legendX": 380,
        "legendY": 650,
        "values": [0,10,20,30,40,50,60,70,80,90,100],
        "gradientLength": 600,
        "gradientThickness": 12
      },
      "condition": {
        "test": "!isValid(datum.share) || isNaN(datum.share)",
        "value": "#E5E5E5"
      }
    },
    "tooltip": [
      { "field": "country", "title": "COUNTRY" },
      { "field": "share", "title": "MARKET SHARE (%)", "format": ".1f" }
    ]
  }
};

// ===== Your UPDATED STACKED chart spec =====
const stackSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "description": "Apple revenue share by category (2018 to 2024) with year dropdowns, legend filter, click highlight, and a pandemic annotation line.",
  "title": {
    "text": "Apple revenue by category 2018 to 2024",
    "anchor": "middle",
    "fontSize": 18,
    "fontWeight": "bold"
  },
  "width": 1000,
  "height": 700,
  "background": "white",
  "padding": { "left": 0, "right": 0, "top": 10, "bottom": 50 },

  "data": {
    "url": "https://raw.githubusercontent.com/lawchrisss/w10hw/refs/heads/main/revenue_by_category.csv",
    "format": { "type": "csv" }
  },

  "params": [
    {
      "name": "yearStart",
      "value": 2018,
      "bind": {
        "input": "select",
        "name": "Start Year ",
        "options": [2018, 2019, 2020, 2021, 2022, 2023, 2024]
      }
    },
    {
      "name": "yearEnd",
      "value": 2024,
      "bind": {
        "input": "select",
        "name": "End Year ",
        "options": [2018, 2019, 2020, 2021, 2022, 2023, 2024]
      }
    }
  ],

  "transform": [
    { "calculate": "toNumber(datum.Year)", "as": "YearNum" },
    {
      "fold": ["iPhone_share","iPad_share","Mac_share","Wearables_share","Services_share"],
      "as": ["Category_raw", "Share"]
    },
    { "calculate": "replace(datum.Category_raw, '_share', '')", "as": "Category" },
    { "calculate": "datum.Share / 100", "as": "ShareNormalized" },
    { "calculate": "indexof(['iPhone','iPad','Mac','Wearables','Services'], datum.Category)", "as": "ZOrder" },
    {
      "filter": "datum.YearNum >= (yearStart < yearEnd ? yearStart : yearEnd) && datum.YearNum <= (yearEnd > yearStart ? yearEnd : yearStart)"
    }
  ],

  "layer": [
    {
      "params": [
        {
          "name": "catFilter",
          "select": { "type": "point", "fields": ["Category"] },
          "bind": "legend"
        },
        {
          "name": "layerHighlight",
          "select": {
            "type": "point",
            "fields": ["Category"],
            "on": "click",
            "clear": "dblclick"
          }
        }
      ],
      "transform": [
        { "filter": { "param": "catFilter" } }
      ],
      "mark": { "type": "area", "interpolate": "monotone", "strokeWidth": 0 },
      "encoding": {
        "x": {
          "field": "Year",
          "type": "ordinal",
          "axis": { "title": null, "labelAngle": 0, "labelFontSize": 12 },
          "scale": { "paddingInner": 0, "paddingOuter": 0 }
        },
        "y": {
          "field": "ShareNormalized",
          "type": "quantitative",
          "axis": {
            "title": null,
            "format": ".0%",
            "labelFontSize": 12,
            "values": [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1]
          }
        },
        "color": {
          "field": "Category",
          "type": "nominal",
          "title": null,
          "scale": {
            "domain": ["iPhone","iPad","Mac","Wearables","Services"],
            "range": ["#77A6CB", "#FAAE60", "#B9B3D2", "#82CCC0", "#F87A6D"]
          },
          "legend": {
            "orient": "bottom",
            "direction": "horizontal",
            "columns": 5,
            "symbolType": "circle",
            "symbolSize": 180,
            "labelFontSize": 14,
            "labelLimit": 0,
            "offset": 30
          }
        },
        "opacity": {
          "condition": { "param": "layerHighlight", "value": 1 },
          "value": 0.3
        },
        "order": { "field": "ZOrder", "type": "quantitative" },
        "tooltip": [
          { "field": "Year", "title": "Year" },
          { "field": "Category", "title": "Category" },
          { "field": "Share", "title": "Share (%)", "format": ".0f" }
        ]
      }
    },

    {
      "data": { "values": [ { "Year": "2020" } ] },
      "mark": {
        "type": "rule",
        "strokeDash": [6, 6],
        "stroke": "black",
        "strokeWidth": 2
      },
      "encoding": {
        "x": { "field": "Year", "type": "ordinal", "bandPosition": 0 }
      }
    },

    {
      "data": { "values": [ { "Year": "2020", "label": "Covid -19 Pandemic caused the dip in revenue" } ] },
      "mark": {
        "type": "text",
        "align": "left",
        "baseline": "bottom",
        "dx": 7,
        "dy": -20,
        "fontSize": 16,
        "fontStyle": "italic",
        "fill": "black"
      },
      "encoding": {
        "x": { "field": "Year", "type": "ordinal", "bandPosition": 0 },
        "y": { "datum": 1 },
        "text": { "field": "label" }
      }
    }
  ],

  "config": {
    "axis": { "grid": false },
    "view": { "stroke": null },
    "legend": { "orient": "bottom", "direction": "horizontal" }
  }
};

// ===== Embed them into the sample layout IDs =====
vegaEmbed("#stacked_chart", stackSpec, { actions: false }).catch(console.error);
vegaEmbed("#fnb_map", mapSpec, { actions: false }).catch(console.error);
