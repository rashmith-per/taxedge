package com.taxedge.gst.exception;
 
import java.io.IOException;
 
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
 
@RestControllerAdvice(basePackages = "com.taxedge.gst")
@Component("gstGlobalExceptionHandler")
public class GlobalExceptionHandler {
 
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException( ResourceNotFoundException exception) {
 
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(), HttpStatus.NOT_FOUND.value());
 
        return new ResponseEntity<>( errorResponse, HttpStatus.NOT_FOUND);
    }
 
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception exception) {
 
        exception.printStackTrace();
 
        ErrorResponse errorResponse = new ErrorResponse(
                exception.getMessage(),
                HttpStatus.INTERNAL_SERVER_ERROR.value());
 
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException exception) {
 
        ErrorResponse errorResponse = new ErrorResponse( "File size must not exceed 10 MB",HttpStatus.PAYLOAD_TOO_LARGE.value());
 
        return new ResponseEntity<>( errorResponse, HttpStatus.PAYLOAD_TOO_LARGE );
    }
   
    @ExceptionHandler(MaxDocumentLimitException.class)
    public ResponseEntity<ErrorResponse> handleMaxDocumentLimitException( MaxDocumentLimitException exception) {
 
        ErrorResponse errorResponse = new ErrorResponse(exception.getMessage(),HttpStatus.CONFLICT.value());
 
        return new ResponseEntity<>( errorResponse,HttpStatus.CONFLICT);
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException exception) {
 
        ErrorResponse errorResponse = new ErrorResponse( exception.getMessage(),HttpStatus.BAD_REQUEST.value());
 
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
   
    @ExceptionHandler(IOException.class)
    public ResponseEntity<ErrorResponse> handleIOException(IOException exception) {
 
        ErrorResponse errorResponse = new ErrorResponse( "Error while reading or processing the file",HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
 
        return new ResponseEntity<>(errorResponse,HttpStatus.INTERNAL_SERVER_ERROR);
    }
 
}