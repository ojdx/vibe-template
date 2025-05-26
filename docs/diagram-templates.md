# draw.io Diagram Templates

Common templates for creating consistent diagrams in the elmersho project.

## Basic Architecture Template

```xml
<mxfile host="app.diagrams.net">
  <diagram name="Architecture" id="template-arch">
    <mxGraphModel dx="1000" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <!-- Add your components here -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Flow Diagram Template

```xml
<mxfile host="app.diagrams.net">
  <diagram name="Flow" id="template-flow">
    <mxGraphModel dx="1000" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <!-- Start Node -->
        <mxCell id="start" value="Start" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="80" height="60" as="geometry" />
        </mxCell>
        <!-- Add flow elements here -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Component Diagram Template

```xml
<mxfile host="app.diagrams.net">
  <diagram name="Components" id="template-components">
    <mxGraphModel dx="1000" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <!-- Component Container -->
        <mxCell id="container" value="" style="rounded=0;whiteSpace=wrap;html=1;dashed=1;dashPattern=1 1;" vertex="1" parent="1">
          <mxGeometry x="40" y="40" width="400" height="300" as="geometry" />
        </mxCell>
        <!-- Add components here -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Style Guide

### Colors
- **Primary Components**: `#dae8fc` (light blue)
- **Secondary Components**: `#d5e8d4` (light green)
- **External Systems**: `#f8cecc` (light red)
- **Data Stores**: `#fff2cc` (light yellow)

### Shapes
- **Services/Processes**: Rounded rectangles
- **Data Stores**: Cylinders
- **External Systems**: Dashed rectangles
- **User/Actor**: Stick figure or ellipse

### Arrows
- **Data Flow**: Solid arrows
- **Control Flow**: Dashed arrows
- **Async/Events**: Dotted arrows

## Creating Diagrams from Templates

1. Copy the template XML
2. Save as `.drawio` file
3. Open in draw.io
4. Customize as needed
5. Save and upload to wiki

## Example: Creating a New Feature Diagram

```bash
# Create from template
cat > my-feature.drawio << 'EOF'
<mxfile host="app.diagrams.net">
  <diagram name="My Feature" id="my-feature-id">
    <mxGraphModel dx="1000" dy="600" grid="1" gridSize="10">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <!-- Your content here -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
EOF

# Generate embed code
node scripts/diagram-utils.js embed my-feature.drawio
```