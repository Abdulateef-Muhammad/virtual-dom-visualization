import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import useVirtualDomStore from '../store/virtualDomStore';
import { Grid, Typography, Paper } from '@mui/material';

const VirtualDomDiagram = () => {
  const svgRef = useRef(null);
  const nodes = useVirtualDomStore(state => state.nodes);
  
  // Transform flat nodes array into a tree structure
  const createTreeFromNodes = (nodes) => {
    const root = {
      type: 'root',
      props: { className: 'virtual-dom-root' },
      children: nodes.map(node => ({
        type: node.nodeType,
        props: {
          className: node.className,
          ...node.attributes
        },
        content: node.content,
        id: node.id,
        children: []
      }))
    };
    return root;
  };
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const dimensions = {
      width: svgRef.current.parentElement.clientWidth || 800,
      height: 600
    };

    const duration = 750; // Animation duration in milliseconds
    
    // Create the SVG container if it doesn't exist
    let svg = d3.select(svgRef.current);
    if (svg.select('g').empty()) {
      svg
        .attr('width', dimensions.width)
        .attr('height', dimensions.height)
        .append('g')
        .attr('transform', `translate(50, ${dimensions.height / 2})`);
    }

    const g = svg.select('g');
    
    // Create a tree layout
    const treeLayout = d3.tree()
      .size([dimensions.height - 100, dimensions.width - 200]);
    
    // Create a hierarchy from the virtual DOM data
    const treeData = createTreeFromNodes(nodes);
    const root = d3.hierarchy(treeData);
    
    // Generate the tree layout
    const layoutData = treeLayout(root);

    // Update links
    const link = g.selectAll('.link')
      .data(layoutData.links(), d => d.target.data.id);

    // Remove old links with animation
    link.exit()
      .transition()
      .duration(duration)
      .style('opacity', 0)
      .remove();

    // Add new links with animation
    const linkEnter = link.enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
      .style('opacity', 0)
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2);

    // Update existing and new links
    link.merge(linkEnter)
      .transition()
      .duration(duration)
      .style('opacity', 1)
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x));

    // Update nodes
    const node = g.selectAll('.node')
      .data(layoutData.descendants(), d => d.data.id);

    // Remove old nodes with animation
    node.exit()
      .transition()
      .duration(duration)
      .style('opacity', 0)
      .remove();

    // Add new nodes
    const nodeEnter = node.enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('opacity', 0);

    // Add background rectangles
    nodeEnter.append('rect')
      .attr('class', 'node-bg')
      .attr('x', -60)
      .attr('y', -40)
      .attr('width', 120)
      .attr('height', 80)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', 'white')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)
      .style('opacity', 0.9);

    // Add circles
    nodeEnter.append('circle')
      .attr('r', 5)
      .attr('fill', d => d.data.type === 'root' ? '#9E9E9E' : '#2196F3')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add node type text
    nodeEnter.append('text')
      .attr('dy', '-20')
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .text(d => d.data.type);

    // Add class name text
    nodeEnter.append('text')
      .attr('dy', '0')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text(d => d.data.props.className ? `class: ${d.data.props.className}` : '');

    // Add content preview text
    nodeEnter.append('text')
      .attr('dy', '20')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text(d => {
        if (d.data.content) {
          const content = d.data.content.trim();
          return content.length > 15 ? content.substring(0, 15) + '...' : content;
        }
        return '';
      });

    // Animate new nodes appearing
    nodeEnter.transition()
      .duration(duration)
      .style('opacity', 1);

    // Update existing nodes position with animation
    node.transition()
      .duration(duration)
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('opacity', 1);

    // Update existing nodes' text and styles
    node.select('text')
      .text(d => d.data.type);

    node.select('circle')
      .attr('fill', d => d.data.type === 'root' ? '#9E9E9E' : '#2196F3');
      
  }, [nodes]); // Re-render when nodes change
  
  return (
    <div className="virtual-dom-diagram">
      <h2>Virtual DOM Tree</h2>
      <div className="diagram-container" style={{ width: '100%', height: '100%', overflow: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default VirtualDomDiagram;
