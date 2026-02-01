package com.bookstore.config;

import com.bookstore.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    private static final String[] PUBLIC_PATHS = {
        "/api/auth/",
        "/api/health/",
        "/api/books/",
        "/api/categories/",
        "/api/authors/",
        "/api/publishers/",
        "/api/test/"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String requestPath = request.getRequestURI();
        String authHeader = request.getHeader("Authorization");
        
        logger.info("JwtAuthenticationFilter - Path: {}, Has Auth Header: {}");
        
        // Skip JWT validation for public paths
        boolean isPublicPath = false;
        for (String publicPath : PUBLIC_PATHS) {
            if (requestPath.startsWith(publicPath)) {
                isPublicPath = true;
                break;
            }
        }

        if (!isPublicPath) {
            try {
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    logger.info("Token found, validating...");
                    
                    if (jwtUtil.validateToken(token)) {
                        Integer userId = jwtUtil.getUserIdFromToken(token);
                        String email = jwtUtil.getEmailFromToken(token);
                        logger.info("Token valid - UserId: {}, Email: {}");
                        
                        if (userId != null) {
                            // Create authentication token
                            UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(
                                    email, 
                                    null, 
                                    new ArrayList<>()
                                );
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            request.setAttribute("userId", userId);
                            logger.info("Authentication set successfully");
                        }
                    } else {
                        logger.warn("Token validation failed");
                    }
                } else {
                    logger.warn("No Bearer token found in Authorization header for protected path: {}");
                }
            } catch (Exception e) {
                logger.error("Cannot set user authentication", e);
            }
        }

        filterChain.doFilter(request, response);
    }
}
