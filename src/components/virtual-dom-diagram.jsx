import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import useVirtualDomStore from '../store/virtualDomStore';
import { Box, Typography, Paper } from '@mui/material';

const VirtualDomDiagram = () => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const nodes = useVirtualDomStore(state => state.nodes);
  const selectedNodeId = useVirtualDomStore(state => state.selectedNodeId);
  const setSelectedNode = useVirtualDomStore(state => state.setSelectedNode);
  
  // Transform flat nodes array into a tree structure
  const createTreeFromNodes = (nodes) => {
    console.log('Creating tree from nodes:', nodes);
    
    // Create a map of nodes by their IDs for easier lookup
    const nodesMap = new Map(nodes.map(node => [node.id, node]));

    // Helper function to recursively build the tree
    const buildNodeTree = (nodeId) => {
      const node = nodesMap.get(nodeId);
      if (!node) {
        console.warn(`Node with id ${nodeId} not found`);
        return null;
      }

      return {
        type: node.nodeType || 'unknown',
        props: {
          ...(node.attributes || {})
        },
        content: node.content || '',
        id: node.id,
        children: (node.children || [])
          .map(childId => buildNodeTree(childId))
          .filter(Boolean)
      };
    };

    // Create the root node
    const root = {
      type: 'root',
      id: 'root-node',
      children: nodes
        .filter(node => node.parentId === 'root-node') // Include nodes with root-node as parent
        .map(node => buildNodeTree(node.id))
        .filter(Boolean)
    };
    
    console.log('Created tree structure:', root);
    return root;
  };
  
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    // Get container dimensions
    const container = containerRef.current;
    const dimensions = {
      width: container.clientWidth,
      height: container.clientHeight
    };

    const duration = 750; // Animation duration in milliseconds
    
    // Create the SVG container if it doesn't exist
    let svg = d3.select(svgRef.current);
    if (svg.select('g').empty()) {
      svg
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(80, 0)`);
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
      .attr('id', d => `node-${d.data.id}`)
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('opacity', 0)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        event.stopPropagation();
        console.log('Node clicked:', d.data.id, d.data.type, d);
        setSelectedNode(d.data.id);
      });

    // Add background rectangles with click handling
    nodeEnter.append('rect')
      .attr('class', 'node-bg')
      .attr('id', d => `${d.data.id}`)
      .attr('x', -60)
      .attr('y', -40)
      .attr('width', 120)
      .attr('height', 60)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', d => d.data.type === 'root' ? '#f5f5f5' : 'white')
      .attr('stroke', d => d.data.id === selectedNodeId ? '#FF4081' : '#ccc')
      .attr('stroke-width', d => d.data.id === selectedNodeId ? 2 : 1)
      .style('opacity', 0.9)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        event.stopPropagation();
        console.log('Node background clicked:', d.data.id, d.data.type, d);
        setSelectedNode(d.data.id);
      });

    // Add circles
    nodeEnter.append('circle')
      .attr('r', d => d.data.type === 'root' ? 8 : 5)
      .attr('fill', d => d.data.type === 'root' ? '#9E9E9E' : '#2196F3')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add node type text
    nodeEnter.append('text')
      .attr('dy', '-20')
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('font-size', d => d.data.type === 'root' ? '16px' : '14px')
      .text(d => d.data.type);

    // Add class name text
    nodeEnter.append('text')
      .attr('dy', '0')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#666')

    // Add ID text
    nodeEnter.append('text')
      .attr('dy', '20')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text(d => d.data.id !== 'root' ? `id: ${d.data.id}` : '');

    // Add content preview text
    nodeEnter.append('text')
      .attr('dy', '40')
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

    // Update node selection state
    node.select('rect')
      .attr('stroke', d => d.data.id === selectedNodeId ? '#FF4081' : '#ccc')
      .attr('stroke-width', d => d.data.id === selectedNodeId ? 2 : 1);

    node.select('circle')
      .attr('fill', d => d.data.type === 'root' ? '#9E9E9E' : '#2196F3');
      
  }, [nodes, selectedNodeId, setSelectedNode]); // Re-render when nodes or selection changes
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Virtual DOM Tree
      </Typography>
      <Paper 
        ref={containerRef}
        elevation={0}
        sx={{ 
          height: '100%',
          position: 'relative',
          overflow: 'scroll'
        }}
      >
        <svg 
          ref={svgRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 'auto',
            height: '100%'
          }}
        />
      </Paper>
    </Box>
  );
};

export default VirtualDomDiagram;
